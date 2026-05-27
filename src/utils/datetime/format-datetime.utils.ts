function pad(number: number) {
  if (number < 10) {
    return '0' + number
  }
  return number
}

export function datetimeYMDHis(date: Date | string | null = null, unit: 'days' | 'mins' | null = null, offset: number = 0) {
  let newDate = date ? new Date(date) : new Date()

  if (unit && unit === 'days') newDate.setDate(newDate.getDate() + offset)
  if (unit && unit === 'mins') newDate = new Date(newDate.getTime() + offset * 60000)

  return `${pad(newDate.getFullYear())}-${pad(newDate.getMonth() + 1)}-${pad(newDate.getDate())} ${pad(newDate.getHours())}:${pad(newDate.getMinutes())}:${pad(newDate.getSeconds())}`
}
