#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const { transpile, transpileFile, validate } = require('../src/index.js');

program
  .name('refal')
  .description('Транспайлер языка РЕФАЛ в JavaScript')
  .version('1.0.0');

program
  .command('compile <input>')
  .description('Транспайлить файл .ref в JavaScript')
  .option('-o, --output <file>', 'выходной файл')
  .option('-v, --verbose', 'подробный вывод')
  .action((input, options) => {
    try {
      if (!fs.existsSync(input)) {
        console.error(chalk.red(`Ошибка: файл ${input} не найден`));
        process.exit(1);
      }

      if (!input.endsWith('.ref')) {
        console.error(chalk.yellow(`Предупреждение: файл ${input} не имеет расширения .ref`));
      }

      const outputPath = transpileFile(input, options.output);
      
      if (options.verbose) {
        console.log(chalk.green(`✓ Файл ${input} успешно транспайлен в ${outputPath}`));
      } else {
        console.log(chalk.green(`✓ ${outputPath}`));
      }
    } catch (error) {
      console.error(chalk.red(`Ошибка транспайлинга: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('validate <input>')
  .description('Проверить синтаксис файла .ref')
  .action((input) => {
    try {
      if (!fs.existsSync(input)) {
        console.error(chalk.red(`Ошибка: файл ${input} не найден`));
        process.exit(1);
      }

      const source = fs.readFileSync(input, 'utf8');
      const result = validate(source);

      if (result.valid) {
        console.log(chalk.green(`✓ Файл ${input} имеет корректный синтаксис`));
      } else {
        console.error(chalk.red(`✗ Ошибка синтаксиса в ${input}: ${result.error}`));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red(`Ошибка валидации: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('run <input>')
  .description('Транспайлить и выполнить файл .ref')
  .action((input) => {
    try {
      if (!fs.existsSync(input)) {
        console.error(chalk.red(`Ошибка: файл ${input} не найден`));
        process.exit(1);
      }

      // Транспайлим во временный файл
      const tempOutput = transpileFile(input);
      
      // Выполняем сгенерированный JavaScript
      console.log(chalk.blue('Выполнение программы...'));
      const result = require(path.resolve(tempOutput));
      
      // Ищем точку входа (функцию Go по умолчанию)
      if (result.Go) {
        console.log(result.Go());
      } else {
        console.log(chalk.yellow('Точка входа не найдена. Используйте $ENTRY Go для определения точки входа.'));
      }

      // Удаляем временный файл
      fs.unlinkSync(tempOutput);
    } catch (error) {
      console.error(chalk.red(`Ошибка выполнения: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('repl')
  .description('Интерактивный режим (REPL)')
  .action(() => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'refal> '
    });

    console.log(chalk.blue('РЕФАЛ REPL (Ctrl+C для выхода)'));
    console.log(chalk.gray('Введите код на РЕФАЛ или .help для справки'));

    rl.prompt();

    rl.on('line', (line) => {
      const input = line.trim();

      if (input === '.help') {
        console.log(chalk.cyan('Доступные команды:'));
        console.log('  .help - показать эту справку');
        console.log('  .exit - выйти из REPL');
        console.log('  .clear - очистить экран');
        console.log('');
        console.log(chalk.cyan('Примеры кода:'));
        console.log('  $ENTRY Go { = <Hello>; }');
        console.log('  Hello { = \'Hello, World!\'; }');
      } else if (input === '.exit') {
        rl.close();
        return;
      } else if (input === '.clear') {
        console.clear();
      } else if (input) {
        try {
          const jsCode = transpile(input);
          console.log(chalk.green('✓ Синтаксис корректен'));
          console.log(chalk.gray('Сгенерированный JavaScript:'));
          console.log(jsCode);
        } catch (error) {
          console.error(chalk.red(`✗ Ошибка: ${error.message}`));
        }
      }

      rl.prompt();
    });

    rl.on('close', () => {
      console.log(chalk.blue('До свидания!'));
      process.exit(0);
    });
  });

// Если запущено без команд, показываем справку
if (process.argv.length === 2) {
  program.help();
}

program.parse(); 