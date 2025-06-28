const {
  Program,
  Function,
  Pattern,
  Condition,
  Result,
  Expression,
  StringLiteral,
  NumberLiteral,
  Variable,
  FunctionCall,
  EntryPoint
} = require('./ast.js');

class Parser {
  constructor(source) {
    this.source = source;
    this.position = 0;
    this.tokens = [];
    this.currentToken = null;
  }

  // Лексический анализ
  tokenize() {
    const tokens = [];
    let current = 0;

    while (current < this.source.length) {
      let char = this.source[current];

      // Пропускаем пробелы и переносы строк
      if (/\s/.test(char)) {
        current++;
        continue;
      }

      // Комментарии
      if (char === '*' && this.source[current + 1] === '*') {
        while (current < this.source.length && 
               !(this.source[current] === '*' && this.source[current + 1] === '*')) {
          current++;
        }
        current += 2;
        continue;
      }

      // Строковые литералы
      if (char === "'") {
        let value = '';
        current++;
        while (current < this.source.length && this.source[current] !== "'") {
          value += this.source[current];
          current++;
        }
        current++;
        tokens.push({ type: 'STRING', value });
        continue;
      }

      // Числа
      if (/\d/.test(char)) {
        let value = '';
        while (current < this.source.length && /\d/.test(this.source[current])) {
          value += this.source[current];
          current++;
        }
        tokens.push({ type: 'NUMBER', value: parseInt(value) });
        continue;
      }

      // Идентификаторы и ключевые слова
      if (/[a-zA-Z_$]/.test(char)) {
        let value = '';
        while (current < this.source.length && 
               /[a-zA-Z0-9_$.]/.test(this.source[current])) {
          value += this.source[current];
          current++;
        }
        
        if (value === '$ENTRY') {
          tokens.push({ type: 'ENTRY', value });
        } else {
          tokens.push({ type: 'IDENTIFIER', value });
        }
        continue;
      }

      // Специальные символы
      if (char === '{') {
        tokens.push({ type: 'LBRACE', value: char });
      } else if (char === '}') {
        tokens.push({ type: 'RBRACE', value: char });
      } else if (char === '=') {
        tokens.push({ type: 'EQUALS', value: char });
      } else if (char === '<') {
        tokens.push({ type: 'LANGLE', value: char });
      } else if (char === '>') {
        tokens.push({ type: 'RANGLE', value: char });
      } else if (char === ';') {
        tokens.push({ type: 'SEMICOLON', value: char });
      } else if (char === ',') {
        tokens.push({ type: 'COMMA', value: char });
      }

      current++;
    }

    tokens.push({ type: 'EOF', value: null });
    return tokens;
  }

  // Синтаксический анализ
  parse() {
    this.tokens = this.tokenize();
    this.currentToken = this.tokens[0];
    this.position = 0;

    const functions = [];
    let entryPoint = null;

    while (this.currentToken.type !== 'EOF') {
      if (this.currentToken.type === 'ENTRY') {
        entryPoint = this.parseEntryPoint();
      } else if (this.currentToken.type === 'IDENTIFIER') {
        functions.push(this.parseFunction());
      } else {
        this.advance();
      }
    }

    return new Program(functions, entryPoint);
  }

  parseEntryPoint() {
    this.expect('ENTRY');
    this.expect('IDENTIFIER');
    const functionName = this.previous().value;
    this.expect('LBRACE');
    this.expect('EQUALS');
    this.expect('LANGLE');
    this.expect('IDENTIFIER');
    const targetFunction = this.previous().value;
    
    // Парсим аргументы вызова функции
    const args = [];
    while (this.currentToken.type !== 'RANGLE' && this.currentToken.type !== 'EOF') {
      if (this.currentToken.type === 'COMMA') {
        this.advance();
        continue;
      }
      args.push(this.parseExpression());
    }
    
    this.expect('RANGLE');
    this.expect('SEMICOLON');
    this.expect('RBRACE');
    
    return new EntryPoint(functionName, targetFunction);
  }

  parseFunction() {
    const name = this.currentToken.value;
    this.expect('IDENTIFIER');
    this.expect('LBRACE');
    
    const patterns = [];
    while (this.currentToken.type !== 'RBRACE') {
      patterns.push(this.parsePattern());
    }
    
    this.expect('RBRACE');
    return new Function(name, patterns);
  }

  parsePattern() {
    const conditions = [];
    
    // Парсим левую часть паттерна (до EQUALS)
    while (this.currentToken.type !== 'EQUALS' && 
           this.currentToken.type !== 'SEMICOLON' && 
           this.currentToken.type !== 'RBRACE' &&
           this.currentToken.type !== 'EOF') {
      conditions.push(this.parseExpression());
    }
    
    // Пропускаем EQUALS
    if (this.currentToken.type === 'EQUALS') {
      this.expect('EQUALS');
    }
    
    const result = this.parseResult();
    this.expect('SEMICOLON');
    
    return new Pattern(conditions, result);
  }

  parseResult() {
    const expressions = [];
    while (
      this.currentToken.type !== 'SEMICOLON' &&
      this.currentToken.type !== 'RBRACE' &&
      this.currentToken.type !== 'EOF'
    ) {
      expressions.push(this.parseExpression());
    }
    return new Result(expressions);
  }

  parseExpression() {
    if (this.currentToken.type === 'STRING') {
      const value = this.currentToken.value;
      this.advance();
      return new StringLiteral(value);
    }
    
    if (this.currentToken.type === 'NUMBER') {
      const value = this.currentToken.value;
      this.advance();
      return new NumberLiteral(value);
    }
    
    if (this.currentToken.type === 'LANGLE') {
      return this.parseFunctionCall();
    }
    
    if (this.currentToken.type === 'IDENTIFIER') {
      const name = this.currentToken.value;
      this.advance();
      return new Variable(name);
    }
    
    throw new Error(`Unexpected token: ${this.currentToken.type}`);
  }

  parseFunctionCall() {
    this.expect('LANGLE');
    const functionName = this.currentToken.value;
    this.expect('IDENTIFIER');
    const args = [];
    // Парсим все выражения до RANGLE
    while (this.currentToken.type !== 'RANGLE' && this.currentToken.type !== 'EOF') {
      // Пропускаем запятые (на будущее)
      if (this.currentToken.type === 'COMMA') {
        this.advance();
        continue;
      }
      // Парсим выражение (строка, число, переменная, вызов функции)
      args.push(this.parseExpression());
    }
    this.expect('RANGLE');
    return new FunctionCall(functionName, args);
  }

  advance() {
    this.position++;
    this.currentToken = this.tokens[this.position];
  }

  previous() {
    return this.tokens[this.position - 1];
  }

  expect(type) {
    if (this.currentToken.type === type) {
      this.advance();
    } else {
      throw new Error(`Expected ${type}, got ${this.currentToken.type}`);
    }
  }
}

module.exports = Parser; 