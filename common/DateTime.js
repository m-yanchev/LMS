export function getTimeStampByMonthNumber(number) {
    const date = new Date()
    date.setMonth(date.getMonth() + number)
    return date.getTime()
}

export function formatDateTime(timeStamp, options={}) {
    const date = createDate(timeStamp)
    const dateString = `${date.getFullYear()}-${formatMonth(date)}-${formatDay(date)}`
    const timeString = `T${twoNumb(date.getHours())}:${formatMinutes(date)}`
    return dateString + (options["dateOnly"] ? "" : timeString)
}

export function formatDate(timeStamp) {
    const date = createDate(timeStamp)
    return `${formatDay(date)}.${formatMonth(date)}.${date.getFullYear()}`
}

export function formatTime(timeStamp) {
    const date = createDate(timeStamp)
    return `${date.getHours()}:${formatMinutes(date)}`
}

export function inWeekDay(timeStamp) {
    const date = createDate(timeStamp)
    const _inWeekDay = [
        "в воскресенье", "в понедельник", "во вторник", "в среду", "в четверг", "в пятницу", "в субботу"
    ]
    return _inWeekDay[date.getDay()]
}

function createDate(timeStamp) {
    const date = new Date()
    date.setTime(timeStamp)
    return date
}

function formatMinutes(date) {
    return twoNumb(date.getMinutes())
}

function formatDay(date) {
    return twoNumb(date.getDate())
}

function formatMonth(date) {
    return twoNumb(date.getMonth() + 1)
}

function twoNumb(value) {
    return value < 10 ? "0" + value : value
}
