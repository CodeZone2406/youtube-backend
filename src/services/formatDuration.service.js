const pad = (n) => String(n).padStart(2, "0");

export const formatDuration = (duration) => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};
