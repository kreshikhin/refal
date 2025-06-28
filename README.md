# REFAL Transpiler

A transpiler from the REFAL language to JavaScript, similar to CoffeeScript.

## Installation

```bash
npm install
```

## Usage

### Command Line

```bash
# Transpile a file
node bin/refal.js input.ref -o output.js

# Transpile and print to console
node bin/refal.js input.ref
```

### Programmatic Usage

```javascript
const { transpile } = require('./src/index.js');

const jsCode = transpile(refalCode);
```

## REFAL Syntax

REFAL is a functional programming language with pattern matching.

### Examples

```refal
$ENTRY Go {
  = <Hello>;
}

Hello {
  = 'Hello, World!';
}
```

## Project Structure

- `src/parser.js` - REFAL parser
- `src/ast.js` - Abstract Syntax Tree
- `src/generator.js` - JavaScript code generator
- `src/index.js` - Main module
- `bin/refal.js` - CLI interface
- `examples/` - Example REFAL programs 