const MINUTE_MS = 60 * 1000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

function pad(value: number) {
	return value.toString().padStart(2, "0")
}

function formatTime(date: Date) {
	return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatDate(date: Date) {
	const day = pad(date.getDate())
	const month = pad(date.getMonth() + 1)
	const year = pad(date.getFullYear() % 100)
	return `${day}/${month}/${year}`
}

function startOfDay(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function capitalizeFirst(text: string) {
	if (!text) return text
	return text.charAt(0).toUpperCase() + text.slice(1)
}

type RelativeTimeOptions = {
	now?: Date
	capitalize?: boolean
}

export function relativeTime(date: Date, nowOrOptions: Date | RelativeTimeOptions = new Date()) {
	if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ""

	const options = nowOrOptions instanceof Date ? { now: nowOrOptions } : nowOrOptions
	const now = options.now ?? new Date()
	const shouldCapitalize = options.capitalize ?? false

	const diffMs = now.getTime() - date.getTime()
	const todayStart = startOfDay(now)
	const dateStart = startOfDay(date)
	const dayDiff = Math.floor((todayStart.getTime() - dateStart.getTime()) / DAY_MS)
	let result = ""

	if (dayDiff === 0) {
		if (diffMs < MINUTE_MS) result = "just now"
		else if (diffMs < HOUR_MS) {
			const minutes = Math.floor(diffMs / MINUTE_MS)
			result = `${minutes} minute${minutes === 1 ? "" : "s"} ago`
		} else {
			const hours = Math.floor(diffMs / HOUR_MS)
			result = `${hours} hour${hours === 1 ? "" : "s"} ago`
		}
	} else if (dayDiff === 1) {
		result = `yesterday, ${formatTime(date)}`
	} else if (dayDiff > 1 && dayDiff < 7) {
		const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date)
		result = `${weekday}, ${formatTime(date)}`
	} else {
		result = `${formatDate(date)}, ${formatTime(date)}`
	}

	return shouldCapitalize ? capitalizeFirst(result) : result
}
