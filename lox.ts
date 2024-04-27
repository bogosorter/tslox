import PromptSync from 'prompt-sync';
import { readFileSync } from 'fs';
import Scanner from './scanner';
import Parser from './parser';
import Interpreter from './interpreter';
import Token from './token';
import RuntimeError from './runtimeError';
import { TokenType } from './types';

class Lox {
    hadError = false;
    hadRuntimeError = false;
    interpreter = new Interpreter();

    constructor() {
        if (process.argv.length > 3) console.log('Usage: ts-node lox.ts [script]');
        if (process.argv.length == 2) this.runPrompt();
        else this.runFile(process.argv[2]);
    }

    runFile(path: string) {
        const file = readFileSync(path).toString();
        this.run(file);
    }

    runPrompt() {
        console.log('\nWelcome to Lox!\n');

        const prompt = PromptSync();
        let input = prompt('> ');
        while (input) {
            this.run(input);
            this.hadError = false;
            input = prompt('> ');
        }

        console.log('\nGoodbye!\n');
    }

    run(source: string) {
        const scanner = new Scanner(source, this.scanError.bind(this));
        const tokens = scanner.scanTokens();
        if (this.hadError) return;

        const parser = new Parser(tokens, this.parseError.bind(this));
        const ast = parser.parse();
        if (!ast) return;

        this.interpreter.interpret(ast, this.runtimeError.bind(this));
    }

    scanError(line: number, message: string) {
        this.report(line, "", message);
    }

    parseError(token: Token, message: string) {
        if (token.type == TokenType.EOF) {
            this.report(token.line, " at end", message);
        } else {
            this.report(token.line, ` at '${token.lexeme}'`, message);
        }
    }

    runtimeError(error: RuntimeError) {
        this.report(error.token.line, "", error.message);
        this.hadRuntimeError = true;
    }

    report(line: number, where: string, message: string) {
        console.log(`[line ${line}] Error${where}: ${message}`);
        this.hadError = true;
    }
}

new Lox();