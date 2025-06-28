const fs = require('fs');
const path = require('path');
const Parser = require('./parser.js');
const CodeGenerator = require('./generator.js');

class RefalTranspiler {
  constructor() {
    this.parser = null;
    this.generator = new CodeGenerator();
  }

  transpile(source) {
    try {
      // Парсим исходный код
      this.parser = new Parser(source);
      const ast = this.parser.parse();
      
      // Генерируем JavaScript код
      const jsCode = this.generator.generate(ast);
      
      return jsCode;
    } catch (error) {
      throw new Error(`Transpilation error: ${error.message}`);
    }
  }

  transpileFile(inputPath, outputPath = null) {
    try {
      // Читаем исходный файл
      const source = fs.readFileSync(inputPath, 'utf8');
      
      // Транспайлим код
      const jsCode = this.transpile(source);
      
      // Определяем путь для выходного файла
      if (!outputPath) {
        const dir = path.dirname(inputPath);
        const name = path.basename(inputPath, '.ref');
        outputPath = path.join(dir, `${name}.js`);
      }
      
      // Записываем результат
      fs.writeFileSync(outputPath, jsCode, 'utf8');
      
      return outputPath;
    } catch (error) {
      throw new Error(`File transpilation error: ${error.message}`);
    }
  }

  // Валидация синтаксиса без генерации кода
  validate(source) {
    try {
      this.parser = new Parser(source);
      this.parser.parse();
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // Получение AST для анализа
  getAST(source) {
    this.parser = new Parser(source);
    return this.parser.parse();
  }
}

// Экспортируем функции для удобства использования
function transpile(source) {
  const transpiler = new RefalTranspiler();
  return transpiler.transpile(source);
}

function transpileFile(inputPath, outputPath) {
  const transpiler = new RefalTranspiler();
  return transpiler.transpileFile(inputPath, outputPath);
}

function validate(source) {
  const transpiler = new RefalTranspiler();
  return transpiler.validate(source);
}

function getAST(source) {
  const transpiler = new RefalTranspiler();
  return transpiler.getAST(source);
}

module.exports = {
  RefalTranspiler,
  transpile,
  transpileFile,
  validate,
  getAST
}; 