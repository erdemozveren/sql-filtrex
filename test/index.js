const filterQuery = require('../src/index.js').filterToQuery;
const sql = require('sql-bricks');
let passedTestCount = 0;
function testQuery(input, options, expectedSql) {
  try {
    const prefix = 'SELECT * WHERE ';
    let sqlString = sql.select().where(filterQuery(sql, input, options)).toString();
    sqlString = sqlString.substring(prefix.length)
    const pass = sqlString === expectedSql;
    if (pass) {
      passedTestCount += 1;
    }
    console.log(`${pass ? '✅' : '❌'}`, input);
    if (!pass) {
      console.log('\t-> output : ', sqlString)
      console.log('\t-> expected output : ', expectedSql)
    }
  } catch (e) {
    if (expectedSql === null) {
      console.log(`✅ Threw Expected error: ${input} → ${e.message}`);
      passedTestCount += 1;
    } else {
      console.log(`❌ ${input} threw error:`, e.message);
    }
  }
}
// set output to null to except it to throw
const tests = [
  {
    input: "price >= 100",
    options: { constants: {}, columns: ["price"], functions: [] },
    expected: "price >= 100"
  },
  {
    input: "price >= MIN_PRICE",
    options: { constants: { MIN_PRICE: 50 }, columns: ["price"], functions: [] },
    expected: "price >= 50"
  },
  {
    input: "abs(price) < 5",
    options: { constants: {}, columns: ["price"], functions: ["abs"] },
    expected: "abs(price) < 5"
  },
  {
    input: "abs(score) <= 5 AND category = 'A'",
    options: { constants: {}, columns: ["score", "category"], functions: ["abs"] },
    expected: "abs(score) <= 5 AND category = 'A'"
  },
  {
    input: "floor(MAX_VALUE) = 99",
    options: { constants: { MAX_VALUE: 99 }, columns: [], functions: ["floor"] },
    expected: "floor(99) = 99"
  },
  {
    input: "name ~= 'john%'",
    options: { constants: {}, columns: ["name"], functions: [] },
    expected: "name LIKE 'john%'"
  },
  {
    input: "price between 5 and 10",
    options: { constants: {}, columns: ["price"], functions: [] },
    expected: "price BETWEEN 5 AND 10"
  },
  {
    input: "deleted IS NULL",
    options: { constants: {}, columns: ["deleted"], functions: [] },
    expected: "deleted IS NULL"
  },
  {
    input: "status NOT IN ('archived', 'deleted')",
    options: { constants: {}, columns: ["status"], functions: [] },
    expected: "NOT status IN ('archived', 'deleted')"
  },
  {
    input: "field <> 2",
    options: {},
    expected: 'field <> 2'
  },
  {
    input: "field is null",
    options: {},
    expected: 'field IS NULL'
  },
  {
    input: "field is not null",
    options: {},
    expected: 'field IS NOT NULL'
  },
  {
    input: "field = null",
    options: {},
    expected: 'field IS NULL'
  },
  {
    input: "(field = 2 || field2  > 3) && field3 <=10",
    options: {},
    expected: '(field = 2 OR field2 > 3) AND field3 <= 10'
  },
  {
    input: "(field = 2 or field2  > 3) and field3 <=10",
    options: {},
    expected: '(field = 2 OR field2 > 3) AND field3 <= 10'
  },
  {
    input: "field != null",
    options: {},
    expected: 'field IS NOT NULL'
  },
  {
    input: "secret(price)",
    options: { constants: {}, columns: ["price"], functions: [] },
    expected: null // should throw
  },
  {
    input: "abs(secret_field)",
    options: { constants: {}, columns: ["price"], functions: ["abs"] },
    expected: null // should throw
  },
];

tests.forEach(({ input, options, expected }) => testQuery(input, options, expected));
console.log(`Total: ${tests.length} <> Passed: ${passedTestCount} <> Failed: ${tests.length - passedTestCount}`)
