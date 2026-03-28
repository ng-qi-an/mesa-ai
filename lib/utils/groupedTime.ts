const DAY_MS = 24 * 60 * 60 * 1000

function startOfDay(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function parseDate(value: Date | string | number | null | undefined) {
	if (value instanceof Date) {
		if (Number.isNaN(value.getTime())) return null
		return new Date(value.getTime())
	}

	if (typeof value === "string" || typeof value === "number") {
		const parsed = new Date(value)
		if (Number.isNaN(parsed.getTime())) return null
		return parsed
	}

	return null
}

function capitalizeFirst(text: string) {
	if (!text) return text
	return text.charAt(0).toUpperCase() + text.slice(1)
}

function toTitleCase(text: string) {
	return text
		.split(" ")
		.map((word) => (word ? capitalizeFirst(word.toLowerCase()) : word))
		.join(" ")
}

function applyCapitalization(label: string, capitalization: GroupedTimeCapitalization) {
	if (typeof capitalization === "function") return capitalization(label)

	switch (capitalization) {
		case "none":
			return label
		case "lower":
			return label.toLowerCase()
		case "upper":
			return label.toUpperCase()
		case "title":
			return toTitleCase(label)
		case "sentence":
		default:
			return capitalizeFirst(label)
	}
}

export type GroupedTimeBucket =
	| "today"
	| "yesterday"
	| "days-ago"
	| "weekday"
	| "last-week"
	| "last-month"
	| "this-year"
	| "last-year"
	| "some-time-ago"

export type GroupedTimeCapitalization =
	| "none"
	| "sentence"
	| "title"
	| "upper"
	| "lower"
	| ((label: string) => string)

export type GroupedTimeOptions = {
	now?: Date
	capitalize?: boolean
	capitalization?: GroupedTimeCapitalization
	locale?: string
}

export type GroupedTimeGroup<T> = {
	key: string
	bucket: GroupedTimeBucket
	label: string
	items: T[]
}

type GroupMeta = {
	bucket: GroupedTimeBucket
	rawLabel: string
	rank: number
	dayDiffOrder: number
}

function classifyDate(date: Date | null, now: Date, locale: string) {
	if (!date) {
		return {
			bucket: "some-time-ago",
			rawLabel: "Some time ago",
			rank: 8,
			dayDiffOrder: Number.MAX_SAFE_INTEGER,
		} satisfies GroupMeta
	}

	const nowStart = startOfDay(now)
	const dateStart = startOfDay(date)
	const dayDiff = Math.floor((nowStart.getTime() - dateStart.getTime()) / DAY_MS)

	if (dayDiff < 0) {
		return {
			bucket: "some-time-ago",
			rawLabel: "Some time ago",
			rank: 8,
			dayDiffOrder: Number.MAX_SAFE_INTEGER,
		} satisfies GroupMeta
	}

	if (dayDiff === 0) {
		return {
			bucket: "today",
			rawLabel: "Today",
			rank: 0,
			dayDiffOrder: 0,
		} satisfies GroupMeta
	}

	if (dayDiff === 1) {
		return {
			bucket: "yesterday",
			rawLabel: "Yesterday",
			rank: 1,
			dayDiffOrder: 1,
		} satisfies GroupMeta
	}

	if (dayDiff === 2) {
		return {
			bucket: "days-ago",
			rawLabel: "2 days ago",
			rank: 2,
			dayDiffOrder: 2,
		} satisfies GroupMeta
	}

	if (dayDiff > 2 && dayDiff < 7) {
		return {
			bucket: "weekday",
			rawLabel: new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date),
			rank: 3,
			dayDiffOrder: dayDiff,
		} satisfies GroupMeta
	}

	if (dayDiff >= 7 && dayDiff < 14) {
		return {
			bucket: "last-week",
			rawLabel: "Last week",
			rank: 4,
			dayDiffOrder: dayDiff,
		} satisfies GroupMeta
	}

	const monthDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth())

	if (monthDiff === 1) {
		return {
			bucket: "last-month",
			rawLabel: "Last month",
			rank: 5,
			dayDiffOrder: dayDiff,
		} satisfies GroupMeta
	}

	if (date.getFullYear() === now.getFullYear()) {
		return {
			bucket: "this-year",
			rawLabel: "This year",
			rank: 6,
			dayDiffOrder: dayDiff,
		} satisfies GroupMeta
	}

	if (date.getFullYear() === now.getFullYear() - 1) {
		return {
			bucket: "last-year",
			rawLabel: "Last year",
			rank: 7,
			dayDiffOrder: dayDiff,
		} satisfies GroupMeta
	}

	return {
		bucket: "some-time-ago",
		rawLabel: "Some time ago",
		rank: 8,
		dayDiffOrder: dayDiff,
	} satisfies GroupMeta
}

export function groupedTime<T>(
	items: T[],
	mappedDates: Array<Date | string | number | null | undefined>,
	options: GroupedTimeOptions = {},
) {
	const now = options.now ?? new Date()
	const locale = options.locale ?? "en-US"
	const capitalization = options.capitalization ?? (options.capitalize === false ? "none" : "sentence")

	const prepared = items.map((item, index) => {
		const parsedDate = parseDate(mappedDates[index])
		const meta = classifyDate(parsedDate, now, locale)

		return {
			item,
			date: parsedDate,
			meta,
		}
	})

	prepared.sort((a, b) => {
		if (a.meta.rank !== b.meta.rank) return a.meta.rank - b.meta.rank
		if (a.meta.dayDiffOrder !== b.meta.dayDiffOrder) return a.meta.dayDiffOrder - b.meta.dayDiffOrder

		const aTime = a.date?.getTime() ?? Number.NEGATIVE_INFINITY
		const bTime = b.date?.getTime() ?? Number.NEGATIVE_INFINITY
		return bTime - aTime
	})

	const groups = new Map<string, GroupedTimeGroup<T>>()

	for (const entry of prepared) {
		const groupKey = `${entry.meta.bucket}:${entry.meta.rawLabel.toLowerCase()}`

		if (!groups.has(groupKey)) {
			groups.set(groupKey, {
				key: groupKey,
				bucket: entry.meta.bucket,
				label: applyCapitalization(entry.meta.rawLabel, capitalization),
				items: [],
			})
		}

		groups.get(groupKey)?.items.push(entry.item)
	}

	return Array.from(groups.values())
}

export function groupByRelativeDate<T>(
	items: T[],
	mappedDates: Array<Date | string | number | null | undefined>,
	options: GroupedTimeOptions = {},
) {
	return groupedTime(items, mappedDates, options)
}
