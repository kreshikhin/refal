const Parser = require('./src/parser.js');

const source = `$ENTRY Go {
  = <Hello>;
}

Hello {
  = 'Hello, World!';
}`;

const parser = new Parser(source);
const tokens = parser.tokenize();

console.log('Tokens:');
tokens.forEach((token, index) => {
  console.log(`${index}: ${token.type} = ${JSON.stringify(token.value)}`);
}); 