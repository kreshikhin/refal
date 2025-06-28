const { transpile, validate, getAST } = require('../src/index.js');

describe('REFAL Transpiler', () => {
  describe('Basic Syntax', () => {
    test('should parse simple hello world program', () => {
      const source = `
        $ENTRY Go {
          = <Hello>;
        }

        Hello {
          = 'Hello, World!';
        }
      `;

      const result = validate(source);
      expect(result.valid).toBe(true);
    });

    test('should generate JavaScript for hello world', () => {
      const source = `
        $ENTRY Go {
          = <Hello>;
        }

        Hello {
          = 'Hello, World!';
        }
      `;

      const jsCode = transpile(source);
      expect(jsCode).toContain('refalRuntime');
      expect(jsCode).toContain('Hello: function');
      expect(jsCode).toContain("'Hello, World!'");
    });

    test('should handle multiple functions', () => {
      const source = `
        $ENTRY Go {
          = <Greet 'John'>;
        }

        Greet {
          s.Name = <Concat 'Hello, ' s.Name>;
        }

        Concat {
          s.1 s.2 = <Add s.1 s.2>;
        }
      `;

      const result = validate(source);
      expect(result.valid).toBe(true);
    });
  });

  describe('AST Generation', () => {
    test('should generate AST with functions', () => {
      const source = `
        Hello {
          = 'Hello, World!';
        }
      `;

      const ast = getAST(source);
      expect(ast.functions).toHaveLength(1);
      expect(ast.functions[0].name).toBe('Hello');
    });

    test('should generate AST with entry point', () => {
      const source = `
        $ENTRY Go {
          = <Hello>;
        }

        Hello {
          = 'Hello, World!';
        }
      `;

      const ast = getAST(source);
      expect(ast.entryPoint).toBeDefined();
      expect(ast.entryPoint.functionName).toBe('Go');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid syntax', () => {
      const source = `
        Hello {
          = 'Hello, World!'
        }
      `;

      const result = validate(source);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should handle missing semicolon', () => {
      const source = `
        Hello {
          = 'Hello, World!'
        }
      `;

      const result = validate(source);
      expect(result.valid).toBe(false);
    });
  });

  describe('String Literals', () => {
    test('should handle string literals', () => {
      const source = `
        Hello {
          = 'Hello, World!';
        }
      `;

      const jsCode = transpile(source);
      expect(jsCode).toContain("'Hello, World!'");
    });

    test('should handle empty strings', () => {
      const source = `
        Empty {
          = '';
        }
      `;

      const jsCode = transpile(source);
      expect(jsCode).toContain("''");
    });
  });

  describe('Function Calls', () => {
    test('should handle function calls', () => {
      const source = `
        $ENTRY Go {
          = <Hello>;
        }

        Hello {
          = 'Hello, World!';
        }
      `;

      const jsCode = transpile(source);
      expect(jsCode).toContain('refalRuntime.Hello()');
    });

    test('should handle function calls with arguments', () => {
      const source = `
        $ENTRY Go {
          = <Greet 'John'>;
        }

        Greet {
          s.Name = <Concat 'Hello, ' s.Name>;
        }
      `;

      const jsCode = transpile(source);
      expect(jsCode).toContain('refalRuntime.Greet');
    });
  });

  describe('Variables', () => {
    test('should handle variables in patterns', () => {
      const source = `
        Greet {
          s.Name = <Concat 'Hello, ' s.Name>;
        }
      `;

      const result = validate(source);
      expect(result.valid).toBe(true);
    });

    test('should handle multiple variables', () => {
      const source = `
        Add {
          s.1 s.2 = <AddNumbers s.1 s.2>;
        }
      `;

      const result = validate(source);
      expect(result.valid).toBe(true);
    });
  });

  describe('Complex Expressions', () => {
    test('should handle nested function calls', () => {
      const source = `
        $ENTRY Go {
          = <Process <GetData>>;
        }

        Process {
          s.Data = <Format s.Data>;
        }
      `;

      const result = validate(source);
      expect(result.valid).toBe(true);
    });

    test('should handle multiple expressions in result', () => {
      const source = `
        Format {
          s.Data = 'Processed: ' s.Data;
        }
      `;

      const result = validate(source);
      expect(result.valid).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle function with no patterns', () => {
      const source = `
        Empty {
        }
      `;

      const result = validate(source);
      expect(result.valid).toBe(true);
    });

    test('should handle function with empty result', () => {
      const source = `
        NoResult {
          = ;
        }
      `;

      const result = validate(source);
      expect(result.valid).toBe(true);
    });
  });
}); 