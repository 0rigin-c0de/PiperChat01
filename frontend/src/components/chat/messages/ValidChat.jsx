import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Hash, Pencil, Trash2, Save, SendHorizontal } from "lucide-react";
import socket from "../../socket/Socket";
import { useParams } from "react-router-dom";
import { clear_channel_unread } from "../../../store/unreadSlice";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

function ValidChat() {
  const dispatch = useDispatch();
  const url = process.env.REACT_APP_URL;
  const { server_id } = useParams();

  // channel creds from redux
  const channel_id = useSelector((state) => state.currentPage.page_id);
  const channel_name = useSelector((state) => state.currentPage.page_name);

  // user creds from redux
  const username = useSelector((state) => state.user_info.username);
  const tag = useSelector((state) => state.user_info.tag);
  const profile_pic = useSelector((state) => state.user_info.profile_pic);
  const id = useSelector((state) => state.user_info.id);

  const [chat_message, setchat_message] = useState("");
  const [all_messages, setall_messages] = useState(null);
  const [editingTimestamp, setEditingTimestamp] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  useEffect(() => {
    socket.emit("join_chat", channel_id);
  }, [channel_id]);

  const sendNow = async () => {
    if (!chat_message.trim()) return;
    const message_to_send = chat_message;
    const timestamp = Date.now();
    setchat_message("");
    await store_message(message_to_send, timestamp);
  };

  const store_message = async (chat_message, timestamp) => {
    const res = await fetch(`${url}/store_message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        message: chat_message,
        server_id,
        channel_id,
        channel_name,
        timestamp,
        username,
        tag,
        id,
        profile_pic,
      }),
    });
    const data = await res.json();
    if (data.status !== 200) {
      setchat_message(chat_message);
    }
  };

  useEffect(() => {
    if (channel_id !== "") {
      dispatch(clear_channel_unread({ server_id, channel_id }));
      fetch(`${url}/mark_channel_read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({ server_id, channel_id }),
      });
      setall_messages(null);
      get_messages();
    }
    // eslint-disable-next-line
  }, [channel_id]);

  const get_messages = async () => {
    const res = await fetch(`${url}/get_messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        channel_id,
        server_id,
      }),
    });
    const data = await res.json();
    if (data.chats.length !== 0) {
      setall_messages(data.chats);
    }
  };

  const editMessage = async (message) => {
    const res = await fetch(`${url}/edit_server_message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        server_id,
        channel_id,
        timestamp: message.timestamp,
        content: editingContent,
      }),
    });
    const data = await res.json();
    if (data.status === 200) {
      setall_messages((currentMessages) =>
        currentMessages.map((entry) =>
          String(entry.timestamp) === String(message.timestamp) &&
          entry.sender_id === id
            ? { ...entry, content: editingContent.trim() }
            : entry
        )
      );
      setEditingTimestamp(null);
      setEditingContent("");
    }
  };

  const deleteMessage = async (message) => {
    const res = await fetch(`${url}/delete_server_message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        server_id,
        channel_id,
        timestamp: message.timestamp,
      }),
    });
    const data = await res.json();
    if (data.status === 200) {
      setall_messages((currentMessages) =>
        currentMessages.filter(
          (entry) =>
            !(String(entry.timestamp) === String(message.timestamp) && entry.sender_id === id)
        )
      );
    }
  };

  useEffect(() => {
    const handleReceiveMessage = (messageData) => {
      setall_messages((currentMessages) => {
        const existingMessages = currentMessages || [];
        const alreadyExists = existingMessages.some(
          (entry) =>
            String(entry.timestamp) === String(messageData.timestamp) &&
            entry.sender_id === messageData.sender_id
        );

        if (alreadyExists) {
          return existingMessages;
        }

        return [...existingMessages, messageData];
      });
    };

    const handleUpdatedMessage = (message_data) => {
      setall_messages((currentMessages) =>
        (currentMessages || []).map((entry) =>
          String(entry.timestamp) === String(message_data.timestamp) &&
          entry.sender_id === message_data.sender_id
            ? { ...entry, content: message_data.content }
            : entry
        )
      );
    };

    const handleDeletedMessage = (message_data) => {
      setall_messages((currentMessages) =>
        (currentMessages || []).filter(
          (entry) =>
            !(
              String(entry.timestamp) === String(message_data.timestamp) &&
              entry.sender_id === message_data.sender_id
            )
        )
      );
    };

    socket.on("server_message_received", handleReceiveMessage);
    socket.on("server_message_updated", handleUpdatedMessage);
    socket.on("server_message_deleted", handleDeletedMessage);

    return () => {
      socket.off("server_message_received", handleReceiveMessage);
      socket.off("server_message_updated", handleUpdatedMessage);
      socket.off("server_message_deleted", handleDeletedMessage);
    };
  }, []);

  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="rounded-3xl border border-white/10 bg-black/25 p-5 shadow-soft backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5">
              <Hash className="h-5 w-5 text-brand-300" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-white">
                Welcome to #{channel_name}
              </div>
              <div className="text-sm text-white/60">
                This is the start of the #{channel_name} channel.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {(all_messages || []).map((elem) => {
            const date = new Date(Number(elem.timestamp));
            const timestamp = `${date.toDateString()}, ${String(
              date.getHours()
            ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

            const mine = elem.sender_id === id;
            const isEditing = editingTimestamp === elem.timestamp && mine;

            return (
              <div
                key={`${elem.timestamp}-${elem.sender_id}`}
                className="group -mx-2 flex gap-3 rounded-2xl px-2 py-2 transition hover:bg-white/5"
              >
                <div className="relative mt-0.5 h-10 w-10 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                  <img
                    src={elem.sender_pic}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <div className="text-sm font-extrabold text-white/85">
                      {elem.sender_name}
                    </div>
                    <div className="text-xs font-semibold text-white/45">
                      {timestamp}
                    </div>
                    {mine ? (
                      <div className="ml-auto flex items-center gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                        <button
                          type="button"
                          className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
                          onClick={() => {
                            setEditingTimestamp(elem.timestamp);
                            setEditingContent(elem.content);
                          }}
                          title="Edit"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
                          onClick={() => deleteMessage(elem)}
                          title="Delete"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null}
                  </div>

                  {isEditing ? (
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && editingContent.trim()) {
                            editMessage(elem);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => editMessage(elem)}
                        disabled={!editingContent.trim()}
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-white/85">
                      {elem.content}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/25 p-3">
        <div className="flex items-center gap-2">
          <Input
            value={chat_message}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendNow();
              }
            }}
            onChange={(e) => setchat_message(e.target.value)}
            placeholder={`Message #${channel_name}`}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={sendNow}
            disabled={!chat_message.trim()}
            className="h-10 rounded-2xl"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ValidChat;
