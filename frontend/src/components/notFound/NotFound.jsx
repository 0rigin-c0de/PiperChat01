import { Link as RouterLink } from "react-router-dom";
import AuthShell from "../auth/AuthShell";
import { motion } from "framer-motion";

function PrimaryButton({ children, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.15 }}
      className="w-full h-12 rounded-xl text-sm font-bold tracking-wide transition-all duration-200"
      style={{
        background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        boxShadow: "0 4px 24px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
        letterSpacing: "0.04em",
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

function NotFound() {
  return (
    <AuthShell mode="notfound">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div>
            <h1
              className="text-4xl font-black tracking-tight mb-2"
              style={{ color: "#f0f0f5" }}
            >
              404
            </h1>
            <h2
              className="text-xl font-semibold tracking-tight"
              style={{ color: "#f0f0f5" }}
            >
              Page Not Found
            </h2>
            <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              The page you&apos;re looking for doesn&apos;t exist.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <RouterLink to="/" className="w-full max-w-xs">
            <PrimaryButton>
              Go Home
            </PrimaryButton>
          </RouterLink>
        </div>
      </motion.div>
    </AuthShell>
  );
}

export default NotFound;