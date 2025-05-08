const jison = require('jison');
const grammar = {
  "parseParams": ["columns", "functions", "constants"],
  "lex": {
    "options": { "case-insensitive": true },
    "rules": [
      ["\\s+", ""],
      [">=", "return 'GTE';"],
      ["<=", "return 'LTE';"],
      ["!=", "return 'NEQ';"],
      ["=", "return 'EQ';"],
      ["~=", "return 'LIKE';"],
      ["<>", "return 'NEQ';"],
      [">", "return 'GT';"],
      ["<", "return 'LT';"],
      ["and\\b", "return 'AND';"],
      ["or\\b", "return 'OR';"],
      ["not\\b", "return 'NOT';"],
      ["between\\b", "return 'BETWEEN';"],
      ["is\\b", "return 'IS';"],
      ["null\\b", "return 'NULL';"],
      ["in\\b", "return 'IN';"],
      ["\\(", "return '(';"],
      ["\\)", "return ')';"],
      [",", "return ',';"],
      ["[\\?@][a-zA-Z0-9_]*", "return 'SQL_PARAM';"],
      ["[0-9]+(\\.[0-9]+)?\\b", "return 'NUMBER';"],
      ["'[^']*'", "yytext = yytext.slice(1, -1); return 'STRING';"],
      ["[a-zA-Z_][a-zA-Z0-9_]*\\b", "return 'IDENTIFIER';"],
      ["$", "return 'EOF';"],
      [".", "return 'INVALID';"]
    ]
  },

  "operators": [
    ["left", "OR"],
    ["left", "AND"]
  ],

  "bnf": {
    "query": [
      ["expr EOF", "return $1;"]
    ],

    "expr": [
      ["expr OR expr", "$$ = { type: 'OR',     left: $1, right: $3 };"],
      ["expr AND expr", "$$ = { type: 'AND',    left: $1, right: $3 };"],
      ["( expr )", "$$ = $2;"],
      ["value comparison_op value",
        "$$ = { type: 'COMPARE', column: $1, op: $2, value: $3 };"],
      ["value LIKE value", "$$ = { type: 'LIKE',    column: $1, pattern: $3 };"],
      ["value BETWEEN value AND value",
        "$$ = { type: 'BETWEEN', column: $1, low: $3, high: $5 };"],
      ["value IS NULL", "$$ = { type: 'IS_NULL',      column: $1 };"],
      ["value IS NOT NULL", "$$ = { type: 'IS_NOT_NULL',  column: $1 };"],
      ["value IN value_list", "{ $$ = { type: 'IN', column: $1, values: $3 }; }"],
      ["value NOT IN value_list", "{ $$ = { type: 'NOT_IN', column: $1, values: $4 }; }"],
    ],

    "comparison_op": [
      ["EQ", "$$ = '=';"],
      ["NEQ", "$$ = '!=';"],
      ["GT", "$$ = '>';"],
      ["LT", "$$ = '<';"],
      ["GTE", "$$ = '>=';"],
      ["LTE", "$$ = '<=';"]
    ],

    "value": [
      ["NUMBER", "$$ = {type:'NUMBER',value:Number(yytext)};"],
      ["STRING", "$$ = {type:'STRING',value:yytext};"],
      ["SQL_PARAM", "$$ = {type:'SQL_PARAM',value:yytext};"],
      ["IDENTIFIER",
        `{
          if (constants && Object.prototype.hasOwnProperty.call(constants, yytext)) {
            $$ = { type: 'CONST', value: constants[yytext] };
          } else if (columns === null || (columns && columns.includes(yytext))) {
            $$ = { type: 'COLUMN', name: yytext };
          } else {
            throw new Error("Column '" + yytext + "' is not allowed");
          }
        }`
      ],
      ["IDENTIFIER ( )",
        `{
            const fnName = $1.toLowerCase();
            if (functions && !functions.includes(fnName)) {
              throw new Error(\`Function '\${$1}' is not allowed\`);
            }
            $$ = { type: 'FUNCTION', name: fnName, args: [] };
          }`
      ],
      ["IDENTIFIER value_list",
        `{
            const fnName = $1.toLowerCase();
            if (functions && !functions.includes(fnName)) {
              throw new Error(\`Function '\${$1}' is not allowed\`);
            }
            $$ = { type: 'FUNCTION', name: fnName, args: $2 };
          }`
      ]
    ],
    "value_list": [
      ["( value_list_items )", "$$ = $2;"]
    ],
    "value_list_items": [
      ["value", "$$ = [$1];"],
      ["value_list_items , value", "$$ = $1.concat([$3]);"]
    ],

  }
}
const parser = new jison.Parser(grammar);

module.exports = function parseExpression(input, options = {}) {
  const columns = Array.isArray(options.columns) && options.columns.length > 0 ? options.columns : null;
  const functions = Array.isArray(options.functions) ? options.functions : [];
  const constants = typeof options.constants === 'object' && options.constants !== null ? options.constants : {};
  return parser.parse(input, columns, functions, constants);
}
