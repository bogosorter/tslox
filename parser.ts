import Token from './token';
import { Expression, Binary, Grouping, Literal, Unary } from './expressions';
import { Statement, ExpressionStatement, PrintStatement } from './statements';
import { TokenType } from './types';

export default class Parser {
    tokens: Token[];
    current: number = 0;
    reportError: (token: Token, message: string) => void;

    constructor(tokens: Token[], reportError: (token: Token, message: string) => void) {
        this.tokens = tokens;
        this.reportError = reportError;
    }

    parse() {
        const statements: Statement[] = [];
        while (!this.isAtEnd()) statements.push(this.statement());
        return statements;
    }

    statement() {
        if (this.match(TokenType.PRINT)) return this.printStatement();
        return this.expressionStatement();
    }

    printStatement() {
        const value = this.expression();
        this.consume(TokenType.SEMICOLON, "Expected ';' after value.");
        return new PrintStatement(value);
    }

    expressionStatement() {
        const value = this.expression();
        this.consume(TokenType.SEMICOLON, "Expected ';' after value.");
        return new ExpressionStatement(value);
    }

    expression() {
        return this.equality();
    }

    equality() {
        let expression = this.comparison();

        while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
            let operator = this.previous();
            const right = this.comparison();
            expression = new Binary(expression, operator, right);
        }

        return expression;
    }

    comparison() {
        let expression = this.term();

        while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
            let operator = this.previous();
            const right = this.term();
            expression = new Binary(expression, operator, right);
        }

        return expression;
    }

    term() {
        let expression = this.factor();

        while (this.match(TokenType.MINUS, TokenType.PLUS)) {
            let operator = this.previous();
            const right = this.factor();
            expression = new Binary(expression, operator, right);
        }

        return expression;
    }

    factor() {
        let expression = this.unary();

        while (this.match(TokenType.SLASH, TokenType.STAR)) {
            let operator = this.previous();
            const right = this.unary();
            expression = new Binary(expression, operator, right);
        }

        return expression;
    }

    unary(): Expression {
        if (this.match(TokenType.BANG, TokenType.MINUS)) {
            let operator = this.previous();
            const right = this.unary();
            return new Unary(operator, right);
        }

        return this.primary();
    }

    primary(): Expression {
        if (this.match(TokenType.FALSE)) return new Literal(false);
        if (this.match(TokenType.TRUE)) return new Literal(true);
        if (this.match(TokenType.NIL)) return new Literal(null);

        if (this.match(TokenType.NUMBER, TokenType.STRING)) {
            return new Literal(this.previous().literal);
        }

        if (this.match(TokenType.LEFT_PARENTHESIS)) {
            const expression = this.expression();
            this.consume(TokenType.RIGHT_PARENTHESIS, "Expected ')' after expression.");
            return new Grouping(expression);
        }

        throw this.error(this.peek(), "Expected expression.");
    }

    synchronize() {
        this.advance();

        while (!this.isAtEnd()) {
            if (this.previous().type == TokenType.SEMICOLON) return;

            const types = [
                TokenType.CLASS,
                TokenType.FUN,
                TokenType.VAR,
                TokenType.FOR,
                TokenType.IF,
                TokenType.WHILE,
                TokenType.PRINT,
                TokenType.RETURN
            ];
            if (this.peek().type in types) return;

            this.advance();
        }
    }

    match(...types: TokenType[]) {
        for (let type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }

        return false;
    }

    check(type: TokenType) {
        if (this.isAtEnd()) return false;
        return this.peek().type == type;
    }

    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    isAtEnd() {
        return this.peek().type == TokenType.EOF;
    }

    peek() {
        return this.tokens[this.current];
    }

    previous() {
        return this.tokens[this.current - 1];
    }

    consume(type: TokenType, message: string) {
        if (this.check(type)) return this.advance();
        throw this.error(this.peek(), message);
    }

    error(token: Token, message: string) {
        this.reportError(token, message);
        return new Error();
    }
}