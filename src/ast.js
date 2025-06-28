// Абстрактное синтаксическое дерево для РЕФАЛ

class ASTNode {
  constructor(type, location = null) {
    this.type = type;
    this.location = location;
  }
}

class Program extends ASTNode {
  constructor(functions = []) {
    super('Program');
    this.functions = functions;
  }
}

class Function extends ASTNode {
  constructor(name, patterns = []) {
    super('Function');
    this.name = name;
    this.patterns = patterns;
  }
}

class Pattern extends ASTNode {
  constructor(conditions = [], result) {
    super('Pattern');
    this.conditions = conditions;
    this.result = result;
  }
}

class Condition extends ASTNode {
  constructor(type, value) {
    super('Condition');
    this.conditionType = type;
    this.value = value;
  }
}

class Result extends ASTNode {
  constructor(expressions = []) {
    super('Result');
    this.expressions = expressions;
  }
}

class Expression extends ASTNode {
  constructor(type, value) {
    super('Expression');
    this.expressionType = type;
    this.value = value;
  }
}

class StringLiteral extends ASTNode {
  constructor(value) {
    super('StringLiteral');
    this.value = value;
  }
}

class NumberLiteral extends ASTNode {
  constructor(value) {
    super('NumberLiteral');
    this.value = value;
  }
}

class Variable extends ASTNode {
  constructor(name) {
    super('Variable');
    this.name = name;
  }
}

class FunctionCall extends ASTNode {
  constructor(functionName, args = []) {
    super('FunctionCall');
    this.functionName = functionName;
    this.arguments = args;
  }
}

class EntryPoint extends ASTNode {
  constructor(functionName) {
    super('EntryPoint');
    this.functionName = functionName;
  }
}

module.exports = {
  ASTNode,
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
}; 