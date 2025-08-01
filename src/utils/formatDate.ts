export function formatDateTime(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const period = date.getHours() >= 12 ? 'pm' : 'am'

  return `${day}/${month}/${year} ${hours}:${minutes} ${period}`
}
