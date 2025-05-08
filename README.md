# SQL-like expression parser to generate Where Expression for end-users

A lightweight SQL-like expression parser built with Jison and SQLBricks. It supports logical operators, comparison expressions, SQL functions, and external constants for dynamic query generation.
Its very lightweight only dependency is jison, you should install sql-bricks depending on your sql engine sql-bricks,sql-bricks-sqlite,sql-bricks-postgres etc.

## Refs

- [jison](https://github.com/zaach/jison)
- [sql-bricks](https://github.com/cshaa/filtrex/)
  - Inspired by [filtrex](https://github.com/cshaa/filtrex/)

> [!WARNING]
> Its Experimental,not fully battle tested nor it have such a goal, but its use sql-bricks to generate queries so its should safe as sql-bricks. NOT PRODUCTION READY,Use at your own risk.

## Features

- Supports logical operators: `AND`, `OR`
- Handles comparison operators: `=`, `!=`, `>`, `<`, `>=`, `<=`,`<>` and `is null` , `is not null`
- support `IN` clauses with constants and literals
- Validates and processes SQL functions like `UPPER()`, `LOWER()`, `SUBSTR()`
- Supports external constants for dynamic value substitution
- Case-insensitive parsing for SQL keywords
- Supports sql-bricks parameters => ? , @ , ?1 , @1 , @name

## Installation

no npm package.

## Usage

You could look at test file to have some insight.
Here's how you can use this to generate where expression:

```javascript
const { filterToQuery } = require("./src/index.js");
const sql = require("sql-bricks"); // you should install manually and provide it to this library because sql-bricks has diffrent repos for each engine, sqlite,postgres etc. and it matters

const options = {
  constants: { MY_CONST: "foo" }, // optional
  columns: ["field1", "field2"], // optional, if not defined or empty  all fields allowed.
  functions: ["UPPER", "LOWER", "SUBSTR"], // optional, if not defined or empty no functions allowed.
};
// you don't need to pass db connection just sql-bricks is okay.
const filterWhere = filterToQuery(
  sql,
  "field1 = MY_CONST and price>=10",
  options,
);
// filterWhere is now same as calling
// sql.and(sql.eq('field1','foo'),sql.gte('price',10))
// and you you just provide it to query and chain it if needed
const sqlQuery = sql.select().from("my_table").where(filterWhere).all();

console.log(sqlQuery);
```

## Configuration

- **constants**: An object mapping constant names to their values. These are substituted during parsing.
- **functions**: An array of permitted SQL function names. The parser will validate function usage against this list.
- **columns**: An array of permitted column names. The parser will validate column usage against this list,empty list means columns will not be checked.

## License

This project is licensed under the MIT License.
Feel free to customize
