function isSameDay(a, b) {
  // b > a
  const yearA = a.getFullYear();
  const yearB = b.getFullYear();
  const monthA = a.getMonth();
  const monthB = b.getMonth();
  const dateA = a.getDate();
  const dateB = b.getDate();

  return yearA === yearB && monthA === monthB && dateA === dateB;
}

function dateTo8DStr(d) {
  //to YYYYMMDD
  const year = d.getFullYear();
  let month = d.getMonth() + 1;
  month = month < 10 ? "0" + month : month;
  const date = d.getDate();
  return "" + year + month + date;
}

function dateTo8DStrHyphen(d) {
  //to YYYY-MM-DD
  const year = d.getFullYear();
  let month = d.getMonth() + 1;
  month = month < 10 ? "0" + month : month;
  const date = d.getDate();
  return "" + year + "-" + month + "-" + date;
}

function dateTo8DStrSlash(d) {
  //to YYYY/MM/DD
  const year = d.getFullYear();
  let month = d.getMonth() + 1;
  const date = d.getDate();
  return "" + month + "/" + date + "/" + year;
}

module.exports = {
  isSameDay,
  dateTo8DStr,
  dateTo8DStrHyphen,
  dateTo8DStrSlash,
};
