const express = require("express");
const app = express();
const http = require("http");
require("dotenv").config();
const port = process.env.PORT || 3080;
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { Server } = require("socket.io");
const short_id = require("shortid");

app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
  console.log("Connected to DB");
});

const io = require("socket.io")(server, {
  pingTimeout: 20000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  socket.on("channelCreated", (data) => {
    io.emit("newChannel", data);
  });
});

io.on("connection", (socket) => {
  socket.on("get_userid", (user_id) => {
    socket.join(user_id);
  });

  socket.on(
    "send_req",
    (receiver_id, sender_id, sender_profile_pic, sender_name) => {
      socket.to(receiver_id).emit("recieve_req", {
        sender_name: sender_name,
        sender_profile_pic: sender_profile_pic,
        sender_id,
      });
    }
  );

  socket.on(
    "req_accepted",
    (sender_id, friend_id, friend_name, friend_profile_pic) => {
      socket.to(friend_id).emit("req_accepted_notif", {
        sender_id,
        friend_name: friend_name,
        friend_profile_pic: friend_profile_pic,
      });
    }
  );

  socket.on("join_chat", (channel_id) => {
    socket.join(channel_id);
  });

  socket.on(
    "send_message",
    (channel_id, message, timestamp, sender_name, sender_tag, sender_pic) => {
      socket.to(channel_id).emit("recieve_message", {
        message_data: {
          message,
          timestamp,
          sender_name,
          sender_tag,
          sender_pic,
        },
      });
    }
  );
});

// mongoose config
const mongoose = require("mongoose");
const shortid = require("shortid");
mongoose.connect(process.env.MONGO_URI);

// user modal
var user_details = new mongoose.Schema(
  {
    username: String,
    tag: String,
    email: String,
    password: String,
    dob: String,
    profile_pic: String,
    authorized: Boolean,
    servers: [
      {
        server_name: String,
        server_pic: String,
        server_role: String,
        server_id: String,
      },
    ],
    incoming_reqs: [
      {
        id: String,
        username: String,
        profile_pic: String,
        tag: String,
        status: String,
      },
    ],
    outgoing_reqs: [
      {
        id: String,
        username: String,
        profile_pic: String,
        tag: String,
        status: String,
      },
    ],
    friends: [
      {
        id: String,
        username: String,
        profile_pic: String,
        tag: String,
      },
    ],
    blocked: [
      {
        id: String,
        username: String,
        profile_pic: String,
        tag: String,
      },
    ],
    verification: [
      {
        timestamp: Number,
        code: String,
      },
    ],

    invites: [
      {
        server_id: String,
        invite_code: String,
        timestamp: String,
      },
    ],
  },
  { typeKey: "$type" }
);

var user_name_details = new mongoose.Schema({
  name: String,
  count: Number,
});

var servers = new mongoose.Schema({
  server_name: String,
  server_pic: String,
  users: [
    {
      user_name: String,
      user_profile_pic: String,
      user_tag: String,
      user_id: String,
      user_role: String,
    },
  ],
  categories: [
    {
      category_name: String,
      channels: [
        {
          channel_name: String,
          channel_type: String,
        },
      ],
    },
  ],
  // will be false when server is deleted
  active: Boolean,
});

var invites = new mongoose.Schema({
  invite_code: String,
  inviter_name: String,
  inviter_id: String,
  server_name: String,
  server_id: String,
  server_pic: String,
  timestamp: String,
});

var chats = new mongoose.Schema({
  server_id: String,
  channels: [
    {
      channel_id: String,
      channel_name: String,
      chat_details: [
        {
          content: String,
          sender_id: String,
          sender_name: String,
          sender_pic: String,
          sender_tag: String,
          timestamp: String,
        },
      ],
    },
  ],
});

var user = mongoose.model("discord_user", user_details);
var servers = mongoose.model("discord_server", servers);
var invites = mongoose.model("discord_invites", invites);
var chats = mongoose.model("discord_chats", chats);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// ****************  all the functions ****************************

// making transporter to send email
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
    clientId: process.env.OAUTH_CLIENTID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
  },
});

function send_mail(otp, mail_value, name_value) {
  var mailOptions = {
    from: process.env.EMAIL_USER,
    to: mail_value,
    subject: "Email for Verification",
    text: `Hello ${name_value}
    You registered an account on PiperChat, Here is your otp for verification - ${otp}
    Kind Regards, Sunil Kumar`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

function generateOTP() {
  var digits = "0123456789";
  let otp = "";
  for (let i = 0; i < 4; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}
async function isusername_available(username) {
  let final_tag = "";
  let tag_exists = true;
  let tag_counter = 0;

  while (tag_exists) {
    final_tag = ("000" + tag_counter).slice(-4);
    tag_exists = await user.exists({ username: username, tag: final_tag });
    tag_counter++;
  }

  return { final_tag, tag_counter };
}

function signup(email, username, password, dob) {
  return new Promise((resolve, reject) => {
    user.find({ email: email }, function (err, data) {
      if (data.length == 0) {
        // this if condition validates the form in case js is off in some browser it also checks if password length is less than 7
        if (username == "" || email == "" || password == "" || dob == "") {
          console.log("entries wrong");
          const response = { message: "wrong input", status: 204 };
          resolve(response);
        } else if (password.length < 7) {
          console.log("password length not enough");
          const response = { message: "password length", status: 400 };
          resolve(response);
        } else {
          const response = { message: true };
          resolve(response);
        }
      } else {
        if (data[0].authorized == true) {
          console.log("user already exists");
          const response = { message: "user already exists", status: 202 };
          resolve(response);
        } else {
          current_time_stamp = data[0].verification[0].timestamp;
          if (
            data[0].username != username &&
            Date.now() - current_time_stamp < 120000
          ) {
            const response = {
              message: "not_TLE",
              otp: data[0].verification[0].code,
            };
            resolve(response);
          }

          //updated account creds without changing otp because otp is not expired yet and someone tried to fill the form again with same email address
          else if (
            data[0].username == username &&
            Date.now() - current_time_stamp < 120000
          ) {
            const response = {
              message: "not_TLE_2",
              otp: data[0].verification[0].code,
              tag: data[0].tag,
            };
            resolve(response);
          }

          //updated account creds with changing otp because otp is expired and someone tried to fill the form again with same email address
          else if (
            data[0].username == username &&
            Date.now() - current_time_stamp > 120000
          ) {
            const response = { message: "TLE", tag: data[0].tag };
            resolve(response);
          } else if (
            data[0].username != username &&
            Date.now() - current_time_stamp > 120000
          ) {
            const response = { message: "TLE_2" };
            resolve(response);
          }
        }
      }
    });
  });
}

function updating_creds(account_creds, otp, email, username) {
  return new Promise((resolve, reject) => {
    user.updateOne({ email: email }, account_creds, function (err, result) {
      console.log("inside updating function");
      if (err) throw err;
      else {
        console.log("going to verification");
      }
      send_mail(otp, email, username);
      const response = { message: "updated", status: 201 };
      resolve(response);
    });
  });
}

function generatetag(count_value) {
  var default_value = "0000";
  var count_value_str = count_value.toString();
  var count_length = count_value_str.length;
  var final_str_1 = default_value.slice(0, default_value.length - count_length);
  var final_str = final_str_1 + count_value_str;
  return final_str;
}

// **************** server functions *********************

function add_server_to_user(id, server_details, server_role) {
  return new Promise((resolve, reject) => {
    const { server_name, server_pic, server_id } = server_details;

    var update_user_details = {
      $push: {
        servers: [
          {
            server_name: server_name,
            server_pic: server_pic,
            server_role: server_role,
            server_id: server_id,
          },
        ],
      },
    };

    user.updateOne({ _id: id }, update_user_details, function (err, data) {
      if (err) console.log(err);
      else {
        resolve(true);
      }
    });
  });
}

function template(user_details, server_details, image) {
  ``;
  return new Promise((resolve, reject) => {
    const { name, type, key, role } = server_details;
    const { id, username, tag, profile_pic } = user_details;

    let server_template = "";

    if (key == 2) {
      server_template = new servers({
        server_name: name,
        server_pic: image,
        users: [
          {
            user_name: username,
            user_profile_pic: profile_pic,
            user_tag: tag,
            user_role: role,
            user_id: id,
          },
        ],
        categories: [
          {
            category_name: "Text Channels",
            channels: [
              {
                channel_name: "general",
                channel_type: "text",
              },
              {
                channel_name: "Clips and Highlights",
                channel_type: "text",
              },
            ],
          },
          {
            category_name: "Voice Channels",
            channels: [
              {
                channel_name: "Lobby",
                channel_type: "voice",
              },
              {
                channel_name: "Gaming",
                channel_type: "voice",
              },
            ],
          },
        ],
      });
    } else if (key == 3) {
      server_template = new servers({
        server_name: name,
        server_pic: image,
        users: [
          {
            user_name: username,
            user_profile_pic: profile_pic,
            user_tag: tag,
            user_role: role,
            user_id: id,
          },
        ],
        categories: [
          {
            category_name: "INFORMATION",
            channels: [
              {
                channel_name: "welcome and rules",
                channel_type: "text",
              },
              {
                channel_name: "announcements",
                channel_type: "text",
              },
              {
                channel_name: "resources",
                channel_type: "text",
              },
              {
                channel_name: "qwerty",
                channel_type: "text",
              },
            ],
          },
          {
            category_name: "Voice Channels",
            channels: [
              {
                channel_name: "Lounge",
                channel_type: "voice",
              },
              {
                channel_name: "Meeting Room 1",
                channel_type: "voice",
              },
              {
                channel_name: "Meeting Room 2",
                channel_type: "voice",
              },
            ],
          },
          {
            category_name: "TEXT CHANNELS",
            channels: [
              {
                channel_name: "general",
                channel_type: "text",
              },
              {
                channel_name: "meeting-plan",
                channel_type: "text",
              },
              {
                channel_name: "off-topic",
                channel_type: "text",
              },
            ],
          },
        ],
      });
    } else {
      server_template = new servers({
        server_name: name,
        server_pic: image,
        users: [
          {
            user_name: username,
            user_profile_pic: profile_pic,
            user_tag: tag,
            user_role: role,
            user_id: id,
          },
        ],
        categories: [
          {
            category_name: "Text Channels",
            channels: [
              {
                channel_name: "general",
                channel_type: "text",
              },
            ],
          },
          {
            category_name: "Voice Channels",
            channels: [
              {
                channel_name: "general",
                channel_type: "voice",
              },
            ],
          },
        ],
      });
    }

    server_template.save(function (err_2, data_2) {
      if (err_2) return console.error(err_2);
      else {
        resolve({
          server_name: name,
          server_pic: image,
          server_id: data_2._id,
        });
      }
    });
  });
}

function add_user_to_server(user_details, server_id) {
  const { username, tag, id, profile_pic } = user_details;

  return new Promise((resolve, reject) => {
    // for appending in user details
    let new_user_to_server = {
      $push: {
        users: [
          {
            user_name: username,
            user_profile_pic: profile_pic,
            user_tag: tag,
            user_role: "member",
            user_id: id,
          },
        ],
      },
    };

    servers.updateOne(
      { _id: server_id },
      new_user_to_server,
      function (err, data) {
        if (err) console.log(err);
        else {
          if (data.modifiedCount > 0) {
            resolve(true);
          }
        }
      }
    );
  });
}

function check_server_in_user(id, server_id) {
  return new Promise((resolve, reject) => {
    user.aggregate(
      [
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },

        {
          $project: {
            servers: {
              $filter: {
                input: "$servers",
                as: "server",
                cond: { $eq: ["$$server.server_id", server_id] },
              },
            },
          },
        },
      ],

      function (err, data) {
        if (err) console.log(err);
        else {
          resolve(data);
        }
      }
    );
  });
}

// ************* invite function **********************

function check_invite_link(inviter_id, server_id) {
  return new Promise((resolve, reject) => {
    user.aggregate(
      [
        {
          $match: {
            _id: new mongoose.Types.ObjectId(inviter_id),
          },
        },

        {
          $project: {
            invites: {
              $filter: {
                input: "$invites",
                as: "invite",
                cond: { $eq: ["$$invite.server_id", server_id] },
              },
            },
          },
        },
      ],

      function (err, data) {
        if (err) console.log(err);
        else {
          resolve(data);
        }
      }
    );
  });
}

// ************** Friend request functions*******************

function check_req(ids, user_id) {
  if (ids.length != 0) {
    for (let i = 0; i < ids.length; i++) {
      if (user_id == ids[i].id) {
        return true;
      } else {
        return false;
      }
    }
  } else {
    return false;
  }
}

function add_friend(user_data, friend_data) {
  const { friend_id, friend_username, friend_tag, friend_profile_pic } =
    friend_data;
  const { id, username, tag, profile_pic } = user_data;

  return new Promise((resolve, reject) => {
    let user_friends_list = {
      $push: {
        friends: [
          {
            id: friend_id,
            username: friend_username,
            profile_pic: friend_profile_pic,
            tag: friend_tag,
          },
        ],
      },
    };

    let friend_friends_list = {
      $push: {
        friends: [
          {
            id: id,
            username: username,
            profile_pic: profile_pic,
            tag: tag,
          },
        ],
      },
    };

    let delete_incoming = { $pull: { incoming_reqs: { id: friend_id } } };

    let delete_outgoing = { $pull: { outgoing_reqs: { id: id } } };

    let param_arr = [user_friends_list, friend_friends_list];
    let param_arr_2 = [delete_incoming, delete_outgoing];
    let id_arr = [id, friend_id];

    for (let i = 0; i < 2; i++) {
      user.updateOne({ _id: id_arr[i] }, param_arr[i], function (err, result) {
        if (err) {
          reject({ message: "something went wrong", status: 404 });
          throw err;
        }
      });

      user.updateOne(
        { _id: id_arr[i] },
        param_arr_2[i],
        function (err, result) {
          if (err) {
            reject({ message: "something went wrong", status: 404 });
            console.log(err);
          }
        }
      );
    }
    resolve({ message: "friend added", status: 200 });
  });
}

// ************** chat functions*******************
function create_chat(server_id) {
  return new Promise((resolve, reject) => {
    var add_chats = new chats({
      server_id: server_id,
    });

    // here we create a new chat document
    add_chats.save(function (err, data) {
      if (err) return console.error(err);
      else {
        resolve({ status: 200 });
      }
    });
  });
}

function get_chats(server_id, channel_id) {
  return new Promise((resolve, reject) => {
    chats.aggregate(
      [
        {
          $match: {
            server_id: server_id,
          },
        },

        {
          $project: {
            channels: {
              $filter: {
                input: "$channels",
                as: "channel",
                cond: { $eq: ["$$channel.channel_id", channel_id] },
              },
            },
          },
        },
      ],

      function (err, data) {
        if (err) console.log(err);
        else {
          resolve(data);
        }
      }
    );
  });
}

// ************** auth function******************

const authToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["x-auth-token"];
    const verified = jwt.verify(authHeader, process.env.ACCESS_TOKEN);
    next();
  } catch (err) {
    res.status(400).json({ message: "not right", status: 400 });
  }
};

app.post("/verify_route", authToken, (req, res) => {
  res.status(201).json({ message: "authorized", status: 201 });
});

app.post("/signup", async (req, res) => {
  const { email, username, password, dob } = req.body;
  authorized = false;

  let response = await signup(email, username, password, dob);

  if (
    response.status == 204 ||
    response.status == 400 ||
    response.status == 202
  ) {
    let status = response.status;
    res.status(status).json({ message: response.message, status: status });
  } else if (response.message == true) {
    const otp = generateOTP();
    let username_response = await isusername_available(username);
    let final_tag = username_response.final_tag;

    var new_user = new user({
      username: username,
      tag: final_tag,
      profile_pic: process.env.default_profile_pic,
      email: email,
      password: password,
      dob: dob,
      authorized: authorized,
      verification: [
        {
          timestamp: Date.now(),
          code: otp,
        },
      ],
    });

    send_mail(otp, email, username);

    new_user.save(function (err_2, data_2) {
      if (err_2) return console.error(err_2);
    });

    res.status(201).json({ message: "data saved", status: 201 });
  } else if (response.message == "not_TLE" || response.message == "TLE_2") {
    let username_response = isusername_available(username);
    let tag = username_response.final_tag;
    var account_creds = {
      $set: {
        username: username,
        tag: tag,
        email: email,
        password: password,
        dob: dob,
        authorized: authorized,
      },
    };
    var otp = 0;
    // username not equal and tl not exceeded
    if (response.message == "not_TLE") {
      var otp = response.otp;
    }

    // username not equal and tl exceeded
    else {
      var otp = generateOTP();
    }

    let new_response = await updating_creds(
      account_creds,
      otp,
      email,
      username
    );
    let status = new_response.status;
    res.status(status).json({ message: new_response.message, status: status });
  } else if (response.message == "not_TLE_2" || response.message == "TLE") {
    let tag = response.tag;
    var otp = 0;

    // username equal and tl not exceeded
    if (response.message == "not_TLE_2") {
      var account_creds = {
        $set: {
          username: username,
          tag: tag,
          email: email,
          password: password,
          dob: dob,
          authorized: authorized,
        },
      };
      var otp = response.otp;
    }

    // username equal and tl exceeded
    else {
      var otp = generateOTP();
      var account_creds = {
        $set: {
          username: username,
          email: email,
          tag: tag,
          password: password,
          dob: dob,
          authorized: authorized,
          verification: [
            {
              timestamp: Date.now(),
              code: otp,
            },
          ],
        },
      };
    }

    let new_response = await updating_creds(
      account_creds,
      otp,
      email,
      username
    );
    let status = new_response.status;
    res.status(status).json({ message: new_response.message, status: status });
  }
});

app.post("/verify", function (req, res) {
  const { email, otp } = req.body;

  user.find({ email: email }, function (err, data_2) {
    if (err) {
      console.log(err);
    } else {
      console.log("verification done");
      current_time_stamp = data_2[0].verification[0].timestamp;
      if (Date.now() - current_time_stamp < 120000) {
        if (req.body.otp_value == data_2[0].verification[0].code) {
          // here we update authorized value to true in our database so next time if someone tries to sign up with this email we can tell that user already exists
          var new_val = { $set: { authorized: true } };
          user.updateOne({ email: email }, new_val, function (err, result) {
            if (err) throw err;
            else {
              res.status(201).json({
                message: "Congrats you are verified now",
                status: 201,
              });
            }
          });
        }
        // wrong otp go back to main page
        else {
          console.log("incorrect");
          res.status(432).json({ error: "incorrect passowrd", status: 432 });
        }
      }
      // now we come to this else condition only if the current time minus the time when user got the otp is greater than 2min which is the time to expire our otp
      // so we change the otp now
      else {
        // updating time stamp value and generating new otp
        const otp = generateOTP();
        var new_val = {
          $set: {
            verification: [
              {
                timestamp: Date.now(),
                code: otp,
              },
            ],
          },
        };
        user.updateOne({ email: email }, new_val, function (err, result) {
          if (err) throw err;
          else {
            send_mail(otp, email, username);
            console.log("otp sent again");
            res.status(442).json({ error: "otp changed", status: 442 });
          }
        });
      }
    }
  });
});

app.post("/signin", function (req, res) {
  user.find({ email: req.body.email }, function (err, data) {
    if (data.length == 0) {
      res
        .status(442)
        .json({ error: "invalid username or password", status: 442 });
      console.log("invalid username or password");
    } else {
      if (req.body.password == data[0].password) {
        if (data[0].authorized == true) {
          const token = jwt.sign(
            {
              id: data[0].id,
              username: data[0].username,
              tag: data[0].tag,
              profile_pic: data[0].profile_pic,
            },
            process.env.ACCESS_TOKEN
          );
          res
            .status(201)
            .json({ message: "you are verified", status: 201, token: token });
          console.log("you are verified");
        } else {
          res
            .status(422)
            .json({ error: "you are not verified yet", status: 422 });
          console.log("you are not verified yet");
        }
      } else {
        res
          .status(442)
          .json({ error: "invalid username or password", status: 442 });
        console.log("invalid username or password");
      }
    }
  });
});

app.post("/add_friend", async function (req, res) {
  let friend = req.body.friend;
  let friend_length = friend.length;
  let hash_index = friend.indexOf("#");
  if (hash_index == -1) {
    res.status(400).json({ message: "Invalid Input", status: 400 });
  } else {
    let name = friend.slice(0, hash_index);
    let user_tag = friend.slice(hash_index + 1, friend_length);
    const authHeader = req.headers["x-auth-token"];
    const user_id = jwt.verify(authHeader, process.env.ACCESS_TOKEN);

    const { id, username, tag, profile_pic } = user_id;

    const isuserexists = new Promise((resolve, reject) => {
      user
        .find({ username: name, tag: user_tag }, function (err, data) {
          if (err) {
            reject(err, "something wrong in add_friend endpoint");
          } else {
            if (data.length == 0) {
              resolve(false);
            } else {
              resolve({
                response: true,
                friend_id: data[0].id,
                friend_username: data[0].username,
                friend_tag: data[0].tag,
                friend_profile_pic: data[0].profile_pic,
                outgoing_reqs: data[0].outgoing_reqs,
                incoming_reqs: data[0].incoming_reqs,
                friends: data[0].friends,
              });
            }
          }
        })
        .clone();
    });

    let result = await isuserexists;

    const {
      incoming_reqs,
      outgoing_reqs,
      friends,
      response,
      friend_id,
      friend_username,
      friend_tag,
      friend_profile_pic,
    } = result;

    if (response == false) {
      res.status(404).json({ message: "User Not found", status: 404 });
    } else {
      const friend_list = check_req(friends, id);

      if (friend_list == true) {
        console.log("already friends");
        res.status(201).json({
          message: "You are already friends with this user",
          status: 201,
        });
      } else {
        const outgoing_list = check_req(outgoing_reqs, id);
        if (outgoing_list == true) {
          const response = await add_friend(user_id, result);
          console.log("friends now");
          // here we will add that user to friend list and not send the request again , this message is only for user simplicity
          res
            .status(201)
            .json({ message: "Request sent successfully", status: 201 });
        } else {
          const incoming_list = check_req(incoming_reqs, id);
          if (incoming_list == true) {
            console.log("request alreay sent");
            res
              .status(202)
              .json({ message: "Request already sent", status: 202 });
          } else {
            let sending_req = {
              $push: {
                incoming_reqs: [
                  {
                    // got these after destructuring the object user_id
                    id: id,
                    username: username,
                    profile_pic: profile_pic,
                    tag: tag,
                    status: "incoming",
                  },
                ],
              },
            };

            let sending_req_2 = {
              $push: {
                outgoing_reqs: [
                  {
                    id: friend_id,
                    username: friend_username,
                    profile_pic: friend_profile_pic,
                    tag: friend_tag,
                    status: "outgoing",
                  },
                ],
              },
            };

            if (response == true) {
              // this update will be done in the data of the receiveing user
              user.updateOne(
                { _id: friend_id },
                sending_req,
                function (err, result) {
                  if (err) throw err;
                  else {
                    // console.log('request sent')
                  }
                }
              );

              // this update will be done in the data of the sending user
              user.updateOne(
                { _id: id },
                sending_req_2,
                function (err, result) {
                  if (err) throw err;
                }
              );
            }
            res.status(203).json({
              message: "Request sent successfully",
              status: 203,
              receiver_id: friend_id,
            });
          }
        }
      }
    }
  }
});

app.get("/user_relations", async function (req, res) {
  try {
    const authHeader = req.headers["x-auth-token"];
    const user_id = jwt.verify(authHeader, process.env.ACCESS_TOKEN);

    const result = await user.findOne({ _id: user_id.id });

    if (!result) {
      return res.status(404).json({ message: "User not found", status: 404 });
    }

    const { incoming_reqs, outgoing_reqs, friends, servers } = result;

    res.status(200).json({
      incoming_reqs: incoming_reqs || [],
      outgoing_reqs: outgoing_reqs || [],
      friends: friends || [],
      servers: servers || [],
    });
  } catch (err) {
    console.error("Error fetching user relations:", err);
    res.status(500).json({ message: "Something went wrong", status: 500 });
  }
});

app.post("/process_req", async function (req, res) {
  const { message, friend_data } = req.body;
  const { id, profile_pic, tag, username } = friend_data;
  final_friend_data = {
    friend_id: id,
    friend_profile_pic: profile_pic,
    friend_tag: tag,
    friend_username: username,
  };

  const authHeader = req.headers["x-auth-token"];
  const user_id = jwt.verify(authHeader, process.env.ACCESS_TOKEN);
  if (message == "Accept") {
    const result = await add_friend(user_id, final_friend_data);
    const { message, status } = result;
    res.status(status).json({ message: message, status: status });
  } else if (message == "Ignore") {
    console.log("will do something about ignore");
  } else if (message == "Unblock") {
    console.log("will do something about Unblock");
  } else if (message == "Cancel") {
    console.log("will do something about Cancel");
  }
});

app.post("/create_server", async function (req, res) {
  const { name, type, key, role } = req.body.server_details;
  const authHeader = req.headers["x-auth-token"];
  const user_id = jwt.verify(authHeader, process.env.ACCESS_TOKEN);

  // create a server in the servers collection
  const server_template = await template(
    user_id,
    req.body.server_details,
    req.body.server_image
  );

  // create a chat collection
  const add_new_chat = await create_chat(server_template.server_id);

  if (add_new_chat.status == 200) {
    // adds server details in user document
    const add_server = await add_server_to_user(
      user_id.id,
      server_template,
      role
    );

    if (add_server == true) {
      res.json({ status: 200, message: "Server Created" });
    } else {
      res.json({ status: 500, message: "Somethig Went Wrong" });
    }
  } else {
    res.json({ status: 500, message: "Somethig Went Wrong" });
  }
});

app.post("/server_info", async function (req, res) {
  const server_id = req.body.server_id;
  const authHeader = req.headers["x-auth-token"];
  const user_id = jwt.verify(authHeader, process.env.ACCESS_TOKEN);

  const response = await check_server_in_user(user_id.id, server_id);

  if (response == []) {
    res.json({ status: 404, message: "you are not authorized" });
  } else {
    const server_info = await servers.find({
      _id: new mongoose.Types.ObjectId(server_id),
    });
    res.json(server_info);
  }
});

app.post("/add_new_channel", function (req, res) {
  const { category_id, channel_name, channel_type, server_id } = req.body;
  var new_channel = {
    $push: {
      "categories.$.channels": {
        channel_name: channel_name,
        channel_type: channel_type,
      },
    },
  };

  servers.updateOne(
    {
      _id: new mongoose.Types.ObjectId(server_id),
      "categories._id": new mongoose.Types.ObjectId(category_id),
    },
    new_channel,
    function (err, data) {
      if (err) console.log(err);
      else {
        if (data.modifiedCount > 0) {
          res.json({ status: 200 });
        }
      }
    }
  );
});

app.post("/add_new_category", function (req, res) {
  const { category_name, server_id } = req.body;
  var new_category = {
    $push: { categories: { category_name: category_name, channels: [] } },
  };

  servers.updateOne(
    { _id: new mongoose.Types.ObjectId(server_id) },
    new_category,
    function (err, data) {
      if (err) console.log(err);
      else {
        if (data.modifiedCount > 0) {
          res.json({ status: 200 });
        }
      }
    }
  );
});

app.post("/create_invite_link", async function (req, res) {
  const { inviter_name, inviter_id, server_name, server_id, server_pic } =
    req.body;

  let response = await check_invite_link(inviter_id, server_id);

  if (response[0].invites == null || response[0].invites.length == 0) {
    const timestamp = Date.now();
    const invite_code = short_id();

    // for appending in invites collection
    var add_new_invite_link = new invites({
      invite_code: invite_code,
      inviter_name: inviter_name,
      inviter_id: inviter_id,
      server_name: server_name,
      server_id: server_id,
      server_pic: server_pic,
      timestamp: timestamp,
    });

    add_new_invite_link.save(function (err_2, data_2) {
      if (err_2) return console.error(err_2);
      else {
        console.log("added to invites collection");
      }
    });

    let user_invites_list = {
      $push: {
        invites: [
          {
            server_id: server_id,
            invite_code: invite_code,
            timestamp: timestamp,
          },
        ],
      },
    };

    user.updateOne(
      { _id: new mongoose.Types.ObjectId(inviter_id) },
      user_invites_list,
      function (err, data) {
        if (err) console.log(err);
        else {
          if (data.modifiedCount > 0) {
            console.log("successfully updated invites");
          }
        }
      }
    );
    res.json({ status: 200, invite_code: invite_code });
  } else {
    res.json({ status: 200, invite_code: response[0].invites[0].invite_code });
  }
});

app.post("/invite_link_info", function (req, res) {
  const invite_link = req.body.invite_link;
  invites.find({ invite_code: invite_link }, function (err, data) {
    if (err) console.log(err);
    else {
      if (data.length == 1) {
        const { inviter_name, server_name, server_pic, server_id, inviter_id } =
          data[0];
        res.json({
          status: 200,
          inviter_name,
          server_name,
          server_pic,
          server_id,
          inviter_id,
        });
      } else {
        res.json({ status: 404 });
      }
    }
  });
});

app.post("/accept_invite", async function (req, res) {
  const { user_details, server_details } = req.body;
  const { id } = user_details;

  const server_id = server_details.invite_details.server_id;

  const check_user = await check_server_in_user(id, server_id);

  if (check_user[0].servers.length == 0) {
    // adds user details to the server docuemnt
    const add_user = await add_user_to_server(user_details, server_id);

    // adds server details in user document
    if (add_user == true) {
      const add_server = await add_server_to_user(
        id,
        server_details.invite_details,
        "member"
      );
      res.json({ status: 200 });
    } else {
      console.log("something went wrong in add_user");
    }

    console.log("user added to server");
  } else {
    console.log("user is already in server");
    res.json({ status: 403 });
  }
});

app.post("/delete_server", function (req, res) {
  const server_id = req.body.server_id;

  var delete_server = { $set: { active: false } };

  servers.updateOne({ _id: server_id }, delete_server, function (err, data) {
    if (err) console.log(err);
    else {
      if (data.modifiedCount > 0) {
        console.log("deleted the server from servers");
      }
    }
  });

  var delete_server_from_user = {
    $pull: { servers: { server_id: server_id } },
  };

  user.updateMany(
    { "servers.server_id": server_id },
    delete_server_from_user,
    function (err, data) {
      if (err) console.log(err);
      else {
        if (data.modifiedCount > 0) {
          console.log("deleted the server from userss");
          res.json({ status: 200 });
        }
      }
    }
  );
});

app.post("/leave_server", function (req, res) {
  console.log("enterd in leave");
  const server_id = req.body.server_id;
  const authHeader = req.headers["x-auth-token"];
  const user_id = jwt.verify(authHeader, process.env.ACCESS_TOKEN);

  var leave_server = { $pull: { servers: { server_id: server_id } } };

  user.updateOne({ _id: user_id.id }, leave_server, function (err, data) {
    if (err) console.log(err);
    else {
      console.log(data);
      if (data.modifiedCount > 0) {
        console.log("deleted server from user");
      }
    }
  });

  var delete_user_from_server = { $pull: { users: { user_id: user_id.id } } };

  servers.updateOne(
    { _id: server_id },
    delete_user_from_server,
    function (err, data) {
      if (err) console.log(err);
      else {
        if (data.modifiedCount > 0) {
          console.log("deleted user from server");
          res.json({ status: 200 });
        }
      }
    }
  );
});

app.post("/store_message", async function (req, res) {
  const {
    message,
    server_id,
    channel_id,
    channel_name,
    timestamp,
    username,
    tag,
    id,
    profile_pic,
  } = req.body;
  console.log(channel_name, channel_id);

  const response = await chats.find({
    server_id: server_id,
    "channels.channel_id": channel_id,
  });

  if (response.length == 0) {
    var push_new_channel = {
      $push: {
        channels: [
          {
            channel_id: channel_id,
            channel_name: channel_name,
            chat_details: [
              {
                content: message,
                sender_id: id,
                sender_name: username,
                sender_pic: profile_pic,
                sender_tag: tag,
                timestamp: timestamp,
              },
            ],
          },
        ],
      },
    };

    chats.updateOne(
      { server_id: server_id },
      push_new_channel,
      function (err, data) {
        if (err) console.log(err);
        else {
          console.log(data);
          if (data.modifiedCount > 0) {
            console.log("channel added in chat");
            res.json({ status: 200 });
          }
        }
      }
    );
  } else {
    var push_new_chat = {
      $push: {
        "channels.$.chat_details": [
          {
            content: message,
            sender_id: id,
            sender_name: username,
            sender_pic: profile_pic,
            sender_tag: tag,
            timestamp: timestamp,
          },
        ],
      },
    };

    chats.updateOne(
      { "channels.channel_id": channel_id },
      push_new_chat,
      function (err, data) {
        if (err) console.log(err);
        else {
          if (data.modifiedCount > 0) {
            console.log("chat added");
            res.json({ status: 200 });
          }
        }
      }
    );
  }
});
app.post("/get_messages", async function (req, res) {
  const { channel_id, server_id } = req.body;

  try {
    if (!channel_id || !server_id) {
      return res
        .status(400)
        .json({ error: "Invalid request. Missing channel_id or server_id." });
    }

    let response = await get_chats(server_id, channel_id);

    if (
      !response ||
      !response[0] ||
      !response[0].channels ||
      response[0].channels.length === 0
    ) {
      return res.json({ chats: [] });
    }

    res.json({ chats: response[0].channels[0].chat_details });
  } catch (error) {
    console.error("Error retrieving chats:", error);
    res.status(500).json({ error: "Failed to retrieve chats." });
  }
});

// Nice
