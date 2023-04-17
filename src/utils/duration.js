const seconds = (n = 1) => 1000 * n;
const minutes = (n = 1) => 1000 * 60 * n;
const hours = (n = 1) => 1000 * 60 * 60 * n;
const days = (n = 1) => 1000 * 60 * 60 * 24 * n;
const weeks = (n = 1) => 1000 * 60 * 60 * 24 * 7 * n;
const months = (n = 1) => 1000 * 60 * 60 * 24 * 30 * n;

module.exports = { seconds, minutes, hours, days, weeks, months };
