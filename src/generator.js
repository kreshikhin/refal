class CodeGenerator {
  constructor() {
    this.indentLevel = 0;
    this.output = '';
  }

  generate(ast) {
    this.output = '';
    this.indentLevel = 0;
    
    // Генерируем заголовок модуля
    this.emit('// Generated by REFAL transpiler');
    this.emit('const refalRuntime = {');
    this.indent();
    
    // Генерируем функции
    for (const func of ast.functions) {
      this.generateFunction(func);
    }
    
    this.dedent();
    this.emit('};');
    this.emit('');
    
    // Генерируем точку входа
    if (ast.entryPoint) {
      this.generateEntryPoint(ast.entryPoint);
    }
    
    return this.output;
  }

  generateFunction(func) {
    this.emit(`${func.name}: function(args) {`);
    this.indent();
    
    // Генерируем паттерны
    for (let i = 0; i < func.patterns.length; i++) {
      const pattern = func.patterns[i];
      if (i > 0) {
        this.emit('} else ');
      }
      this.emit('if (true) { // Pattern matching will be implemented here');
      this.indent();
      this.generateResult(pattern.result);
      this.dedent();
    }
    
    this.emit('}');
    this.dedent();
    this.emit('},');
    this.emit('');
  }

  generateResult(result) {
    if (result.expressions.length === 0) {
      this.emit('return null;');
      return;
    }
    
    if (result.expressions.length === 1) {
      this.emit(`return ${this.generateExpression(result.expressions[0])};`);
    } else {
      this.emit('return [');
      this.indent();
      for (let i = 0; i < result.expressions.length; i++) {
        const expr = result.expressions[i];
        this.emit(`${this.generateExpression(expr)}${i < result.expressions.length - 1 ? ',' : ''}`);
      }
      this.dedent();
      this.emit('];');
    }
  }

  generateExpression(expr) {
    switch (expr.constructor.name) {
      case 'StringLiteral':
        return `'${expr.value}'`;
      
      case 'NumberLiteral':
        return expr.value.toString();
      
      case 'Variable':
        return `args.${expr.name}`;
      
      case 'FunctionCall':
        const args = expr.arguments.map(arg => this.generateExpression(arg)).join(', ');
        return `refalRuntime.${expr.functionName}(${args})`;
      
      default:
        throw new Error(`Unknown expression type: ${expr.constructor.name}`);
    }
  }

  generateEntryPoint(entryPoint) {
    this.emit('// Entry point');
    this.emit(`function ${entryPoint.functionName}() {`);
    this.indent();
    this.emit(`return refalRuntime.${entryPoint.targetFunction}();`);
    this.dedent();
    this.emit('}');
    this.emit('');
    this.emit('// Export for Node.js');
    this.emit('if (typeof module !== "undefined" && module.exports) {');
    this.indent();
    this.emit(`module.exports = { ${entryPoint.functionName} };`);
    this.dedent();
    this.emit('}');
  }

  emit(line) {
    const indent = '  '.repeat(this.indentLevel);
    this.output += indent + line + '\n';
  }

  indent() {
    this.indentLevel++;
  }

  dedent() {
    this.indentLevel--;
  }
}

module.exports = CodeGenerator; 