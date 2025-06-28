const Parser = require('./src/parser.js');

const examples = [
  `<Concat 'Hello, ' s.Name>`,
  `$ENTRY Go {\n  = <Greet 'John'>;\n}\n\nGreet {\n  s.Name = <Concat 'Hello, ' s.Name>;\n}`,
  // Проблемный тест
  `$ENTRY Go {\n  = <Greet 'John'>;\n}\n\nGreet {\n  s.Name = <Concat 'Hello, ' s.Name>;\n}\n\nConcat {\n  s.1 s.2 = <Add s.1 s.2>;\n}`
];

examples.forEach((source, idx) => {
  console.log(`\n--- Example ${idx + 1} ---`);
  const parser = new Parser(source);
  const tokens = parser.tokenize();
  console.log('Tokens:');
  tokens.forEach((token, index) => {
    console.log(`${index}: ${token.type} = ${JSON.stringify(token.value)}`);
  });
  try {
    const ast = parser.parse();
    console.log('AST:', JSON.stringify(ast, null, 2));
  } catch (e) {
    console.error('Parse error:', e.message);
    console.error('Current token:', parser.currentToken);
    console.error('Position:', parser.position);
  }
}); 