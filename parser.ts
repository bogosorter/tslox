import Token from './token';
import { Expression, Binary, Grouping, Literal, Unary, VariableExpression, Assignement } from './expressions';
import { Statement, ExpressionStatement, PrintStatement, VariableDeclaration, Block } from './statements';
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
        let error = false;
        const statements: Statement[] = [];

        while (!this.isAtEnd()) {
            const statement = this.declaration();
            if (statement) statements.push(statement);
            else error = true;
        }
        
        if (error) return null;
        return statements;
    }

    declaration() {
        try {
            if (this.match(TokenType.VAR)) return this.variableDeclaration();
            return this.statement();
        } catch (error) {
            this.synchronize();
            return null;
        }
    }

    variableDeclaration() {
        const name = this.consume(TokenType.IDENTIFIER, "Expected variable name.");
        const initializer = this.match(TokenType.EQUAL)
            ? this.expression()
            : new Literal(null);
        this.consume(TokenType.SEMICOLON, "Expected ';' after variable declaration.");
        return new VariableDeclaration(name, initializer);
    }

    statement() {
        if (this.match(TokenType.PRINT)) return this.printStatement();
        if (this.match(TokenType.LEFT_BRACE)) return new Block(this.block());
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

    block() {
        const statements: Statement[] = [];

        while(!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            const statement = this.declaration();
            if (statement) statements.push(statement);
        }

        this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");
        return statements;
    }

    expression() {
        return this.assignement();
    }

    assignement(): Expression {
        const expression = this.equality();

        if (this.match(TokenType.EQUAL)) {
            const equals = this.previous();
            const value = this.assignement();

            if (expression instanceof VariableExpression) {
                const name = expression.name;
                return new Assignement(name, value);
            }

            this.error(equals, "Invalid assignment target.");
        }

        return expression;
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

        if (this.match(TokenType.IDENTIFIER)) {
            return new VariableExpression(this.previous());
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