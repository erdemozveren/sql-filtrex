# SQL-like Expression Parser for Generating WHERE Clauses

A lightweight, SQL-like expression parser built with **Jison**, designed to help end-users create dynamic `WHERE` expressions. It supports logical operators, comparison expressions, SQL functions, and external constants.

This package is dependency-free, except for SQL generation. You need to install and provide a compatible **SQLBricks** library (e.g., `sql-bricks`, `sql-bricks-sqlite`, `sql-bricks-postgres`, or a custom wrapper).

---

## Refs

- [sql-bricks](https://github.com/cshaa/filtrex/)
- Inspired by [filtrex](https://github.com/cshaa/filtrex/)

> [!WARNING]
> Its use sql-bricks to generate queries so its should safe as sql-bricks. Use at your own risk.

## Features

- Supports logical operators: `AND`, `OR`, `&&` (and), `||` (or)
- Handles comparison operators: `=`, `!=`, `>`, `<`, `>=`, `<=`,`<>` and `is null` , `is not null`
- support `IN` clauses with constants and literals
- Validates and processes SQL functions like `UPPER()`, `LOWER()`, `SUBSTR()`
- Supports external constants for dynamic value substitution
- Case-insensitive parsing for SQL keywords
- Supports sql-bricks parameters => ? , @ , ?1 , @1 , @name

## Installation

You can install `sql-filtrex` via npm:

```bash
npm install sql-filtrex
```

### Peer Dependency

`sql-filtrex` requires a SQL builder library that follows the [SQLBricks](https://github.com/CSNW/sql-bricks) interface for query generation. You can install the appropriate SQLBricks variant based on your database:

```bash
# For general SQL
npm install sql-bricks

# For SQLite
npm install sql-bricks-sqlite

# For PostgreSQL
npm install sql-bricks-postgres
```

> 💡 You can also use any custom library that implements the same method interface as `sql-bricks`.

---

## Usage

You can refer to the test files for more detailed examples. Here's a simple way to use `sql-filtrex` to generate a `WHERE` expression:

```javascript
const { filterToQuery } = require("sql-filtrex");
const sql = require("sql-bricks"); // Install the appropriate SQLBricks version for your DB engine
```

### Example

```javascript
const options = {
  constants: { MY_CONST: "foo" }, // Optional: replace constants in the expression
  columns: ["field1", "field2"], // Optional: restrict allowed fields (empty = allow all)
  functions: ["UPPER", "LOWER", "SUBSTR"], // Optional: allow specific SQL functions
};

// No DB connection needed—just provide a compatible sql-bricks instance
const filterWhere = filterToQuery(
  sql,
  "field1 = MY_CONST and price >= 10",
  options,
);

// `filterWhere` is equivalent to:
// sql.and(sql.eq('field1', 'foo'), sql.gte('price', 10))

// Use it like any other sql-bricks expression
const sqlQuery = sql.select().from("my_table").where(filterWhere).all();

console.log(sqlQuery);
// Output: SELECT * FROM my_table WHERE field1 = 'foo' AND price >= 10
```

---

## Configuration

- **constants**: An object mapping constant names to their values. These are substituted during parsing.
- **functions**: An array of permitted SQL function names. The parser will validate function usage against this list.
- **columns**: An array of permitted column names. The parser will validate column usage against this list,empty list means columns will not be checked.

## License

This project is licensed under the MIT License.
