export function generateDicebearAvatar(seed) {
  const rawSeed = typeof seed === "string" ? seed.trim() : "";
  const normalizedSeed = rawSeed.length > 0 ? rawSeed : Math.random().toString(36).slice(2);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normalizedSeed)}`;
}
