const parser = require('./src/generateParser.js');
const fs = require('fs');

const dist = "./lib/";

// Compile parser
const parserSourceCode = parser.generate();
fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(dist + "parser.js", parserSourceCode, { recursive: true });
