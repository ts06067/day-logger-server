const {
  isSameDay,
  dateTo8DStr,
  dateTo8DStrHyphen,
  dateTo8DStrSlash,
} = require("./helper");

test("same day", () => {
  expect(isSameDay(new Date(), new Date())).toBe(true);
});

test("parse date to 8 digit string", () => {
  expect(dateTo8DStr(new Date(2019, 1, 2))).toBe("2019022");
});

test("parse date to 8 digit string each prec/followed by hyphen", () => {
  expect(dateTo8DStrHyphen(new Date(2019, 1, 2))).toBe("2019-02-2");
});

test("parse date to 8 digit string each prec/followed by slash", () => {
  expect(dateTo8DStrSlash(new Date(2019, 1, 2))).toBe("2/2/2019");
});
