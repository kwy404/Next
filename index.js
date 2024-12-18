const fs = require('fs');
const path = require('path');
const {Lexer} = require('./lexer.js');
const {Parser} = require('./parser.js');
const {Interpreter} = require('./interpreter.js');

if (process.argv.length < 3) {
    console.error('Erro: Por favor, forneça o caminho para o arquivo a ser executado.');
    process.exit(1);
}

const filePath = path.resolve(process.cwd(), process.argv[2]);

if (!fs.existsSync(filePath)) {
    console.error(`Erro: O arquivo "${filePath}" não existe.`);
    process.exit(1);
}

const code = fs.readFileSync(filePath, 'utf-8');

const lexer = new Lexer(code);
const tokens = lexer.tokenize();
const parser = new Parser(tokens);
const ast = parser.parse();
const interpreter = new Interpreter(ast);
interpreter.interpret();