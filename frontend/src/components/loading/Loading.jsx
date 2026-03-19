function Loading() {
  return (
    <div className="grid h-full min-h-[220px] place-items-center">
      <div className="flex items-center gap-3 text-white/70">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-brand-400" />
        <div className="text-sm font-semibold tracking-wide">Loading…</div>
      </div>
    </div>
  );
}

export default Loading
