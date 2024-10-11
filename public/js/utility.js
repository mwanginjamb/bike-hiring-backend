// formatDate
function formatDate(dateString) {
    return moment(dateString).format('YYYY-MM-DD HH:mm:ss');
}

// formatDuration : hrs mm
function formatDuration(hours) {
    const duration = moment.duration(hours, 'hours')
    return `${duration.hours()}h ${duration.minutes()}m`
}