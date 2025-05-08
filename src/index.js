const parseExpression = require('./parser.js');
function astToSqlBricks(sql, node) {
  // its already raw value
  switch (node.type) {
    case 'AND':
    case 'OR':
      // Logical combinations
      return sql[node.type.toLowerCase()](
        astToSqlBricks(sql, node.left),
        astToSqlBricks(sql, node.right)
      );

    case 'COMPARE': {
      // Simple comparisons (=, !=, >, <, >=, <=)
      const { column, op, value } = node;
      // console.log(node)
      const opMap = {
        '=': 'eq',
        '!=': 'notEq',
        '>': 'gt',
        '<': 'lt',
        '>=': 'gte',
        '<=': 'lte'
      };
      const fn = opMap[op];
      if (!fn || !sql[fn]) throw new Error(`Unsupported comparison operator: ${op}`);
      // alias for 'is null'
      if (value?.type === 'NULL') {
        if (fn === 'eq') {
          return sql.isNull(astToSqlBricks(sql, column));
        } else if (fn === 'notEq') {
          return sql.isNotNull(astToSqlBricks(sql, column));
        }
      }
      return sql[fn](astToSqlBricks(sql, column), astToSqlBricks(sql, value));
    }

    case 'LIKE': {
      // LIKE with ~= in the DSL
      return sql.like(astToSqlBricks(sql, node.column), astToSqlBricks(sql, node.pattern));
    }

    case 'BETWEEN': {
      // BETWEEN low AND high
      return sql.between(astToSqlBricks(sql, node.column), astToSqlBricks(sql, node.low), astToSqlBricks(sql, node.high));
    }

    case 'IS_NULL':
      // IS NULL
      return sql.isNull(astToSqlBricks(sql, node.column));

    case 'IS_NOT_NULL':
      // IS NOT NULL
      return sql.isNotNull(astToSqlBricks(sql, node.column));

    case 'IN': {
      // IN [v1, v2, v3, …]
      // sql.in takes (column, valuesArray)
      const processedValues = node.values.map(e => astToSqlBricks(sql, e));
      return sql.in(astToSqlBricks(sql, node.column), processedValues);
    };

    case 'NOT_IN': {
      // NOT IN [v1, v2, …]
      const processedValues = node.values.map(e => astToSqlBricks(sql, e));
      return sql.not(sql.in(astToSqlBricks(sql, node.column), processedValues));
    };
    case 'FUNCTION': {
      // e.g. { type:'FUNCTION', name:'upper', args:[{type:'COLUMN',name:'col'}] }
      const fn = node.name;
      const args = node.args.map(e => e.type === 'STRING' ? JSON.stringify(astToSqlBricks(sql, e)) : astToSqlBricks(sql, e)).join(',');
      // SQL Bricks: sql.func('upper', columnExpr, ...)
      return sql(`${fn}(${args})`);
    }

    case 'CONST':
    case 'STRING':
    case 'NUMBER':
      // e.g. { type:'CONST', value: 34 }
      // We inline constants as literal values
      return node.value;

    case 'NULL':
      return null;

    case 'SQL_PARAM':
      // raw value
      return sql(node.value);

    case 'COLUMN':
      // fallback for identifiers that were not constants
      return sql(node.name);
    default:
      throw new Error(`Unknown AST node type: ${node.type}`);
  }
}
function filterToQuery(sql, filter, options = {}) {
  if (!sql) throw new Error('You must provide a SqlBricks instance');
  if (typeof filter !== 'string') throw new Error('Filter expression must be a string');
  if (typeof options !== 'object' || options === null) throw new Error('Filter expression must be a string');
  const ast = parseExpression(filter, options);
  return astToSqlBricks(sql, ast);
}

module.exports = {
  filterToQuery,
  parseExpression,
};
