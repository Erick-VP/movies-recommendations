export function formatTime(minutes) {
  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return `${hours}h${mins}m`
}
