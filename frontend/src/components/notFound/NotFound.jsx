import { Link as RouterLink } from "react-router-dom";
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
    <div
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{ background: "#0a0a0f" }}
    >
      {/* Gradient overlays matching AuthShell design */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: "-20%",
          left: "-10%",
          width: "55%",
          height: "70%",
          background:
            "radial-gradient(ellipse at center, rgba(124,58,237,0.18) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          bottom: "-15%",
          right: "-10%",
          width: "50%",
          height: "60%",
          background:
            "radial-gradient(ellipse at center, rgba(217,119,6,0.12) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          top: "40%",
          left: "35%",
          width: "30%",
          height: "40%",
          background:
            "radial-gradient(ellipse at center, rgba(16,185,129,0.07) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Noise texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          opacity: 0.4,
        }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 space-y-6 w-full max-w-md px-4 text-center"
      >
        <div className="flex flex-col items-center gap-3">
          <h1
            className="text-6xl font-black tracking-tight"
            style={{ color: "#f0f0f5" }}
          >
            404
          </h1>
          <h2
            className="text-2xl font-semibold tracking-tight"
            style={{ color: "#f0f0f5" }}
          >
            Page Not Found
          </h2>
          <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>

        <div className="pt-4">
          <RouterLink to="/" className="w-full block">
            <PrimaryButton>
              Go Home
            </PrimaryButton>
          </RouterLink>
        </div>
      </motion.div>
    </div>
  );
}

export default NotFound;