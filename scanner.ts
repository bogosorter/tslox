import Token from './token'
import { TokenType, Variable } from './types';

export default class Scanner {
    source: string;
    tokens: Token[] = [];
    start: number = 0;
    current: number = 0;
    line: number = 1;
    reportError: (line: number, message: string) => void;

    constructor(source: string, reportError: (line: number, message: string) => void) {
        this.source = source;
        this.reportError = reportError;
    }

    scanTokens() {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
        return this.tokens;
    }

    scanToken() {
        const c = this.advance();
        if (c == '(') this.addToken(TokenType.LEFT_PARENTHESIS, '(');
        else if (c == ')') this.addToken(TokenType.RIGHT_PARENTHESIS, ')');
        else if (c == '{') this.addToken(TokenType.LEFT_BRACE, '{');
        else if (c == '}') this.addToken(TokenType.RIGHT_BRACE, '}');
        else if (c == ',') this.addToken(TokenType.COMMA, ',');
        else if (c == '.') this.addToken(TokenType.DOT, '.');
        else if (c == '-') this.addToken(TokenType.MINUS, '-');
        else if (c == '+') this.addToken(TokenType.PLUS, '+');
        else if (c == ';') this.addToken(TokenType.SEMICOLON, ';');
        else if (c == '*') this.addToken(TokenType.STAR, '*');
        else if (c == '!') {
            if (this.match('=')) this.addToken(TokenType.BANG_EQUAL, '!=');
            else this.addToken(TokenType.BANG, '!');
        }
        else if (c == '=') {
            if (this.match('=')) this.addToken(TokenType.EQUAL_EQUAL, '==');
            else this.addToken(TokenType.EQUAL, '=');
        }
        else if (c == '<') {
            if (this.match('=')) this.addToken(TokenType.LESS_EQUAL, '<=');
            else this.addToken(TokenType.LESS, '<');
        }
        else if (c == '>') {
            if (this.match('=')) this.addToken(TokenType.GREATER_EQUAL, '>=');
            else this.addToken(TokenType.GREATER, '>');
        }
        else if (c == '/') {
            if (this.match('/')) {
                while (this.source[this.current] != '\n' && !this.isAtEnd()) this.advance();
            }
            else this.addToken(TokenType.SLASH, '/');
        }
        else if (c == ' ' || c == '\r' || c == '\t') return;
        else if (c == '\n') this.line++;
        else if (c == '"') this.string();
        else if (this.isDigit(c)) this.number();
        else if (this.isAlpha(c)) this.identifier();
        else this.reportError(this.line, "Unexpected character.");
    }

    string() {
        while (this.peek() != '"' && !this.isAtEnd()) {
            if (this.peek() == '\n') this.line++;
            this.advance();
        }

        if (this.isAtEnd()) {
            this.reportError(this.line, "Unterminated string.");
            return;
        }

        this.advance();

        const value = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TokenType.STRING, value);
    }

    number() {
        while (this.isDigit(this.peek())) this.advance();

        if (this.peek() == '.' && this.isDigit(this.peekNext())) {
            this.advance();
            while (this.isDigit(this.peek())) this.advance();
        }

        const value = parseFloat(this.source.substring(this.start, this.current));
        this.addToken(TokenType.NUMBER, value);
    }

    identifier() {
        while (this.isAlphaNumeric(this.peek())) this.advance();

        const text = this.source.substring(this.start, this.current);
        if (text == 'and') this.addToken(TokenType.AND);
        else if (text == 'class') this.addToken(TokenType.CLASS);
        else if (text == 'else') this.addToken(TokenType.ELSE);
        else if (text == 'false') this.addToken(TokenType.FALSE);
        else if (text == 'for') this.addToken(TokenType.FOR);
        else if (text == 'fun') this.addToken(TokenType.FUN);
        else if (text == 'if') this.addToken(TokenType.IF);
        else if (text == 'nil') this.addToken(TokenType.NIL);
        else if (text == 'or') this.addToken(TokenType.OR);
        else if (text == 'print') this.addToken(TokenType.PRINT);
        else if (text == 'return') this.addToken(TokenType.RETURN);
        else if (text == 'super') this.addToken(TokenType.SUPER);
        else if (text == 'this') this.addToken(TokenType.THIS);
        else if (text == 'true') this.addToken(TokenType.TRUE);
        else if (text == 'var') this.addToken(TokenType.VAR);
        else if (text == 'while') this.addToken(TokenType.WHILE);
        else this.addToken(TokenType.IDENTIFIER);
    }

    isDigit(c: string) {
        return c >= '0' && c <= '9';
    }

    isAlpha(c: string) {
        if (c >= 'a' && c <= 'z') return true;
        if (c >= 'A' && c <= 'Z') return true;
        if (c == '_') return true;
        return false;
    }

    isAlphaNumeric(c: string) {
        return this.isAlpha(c) || this.isDigit(c);
    }

    isAtEnd() {
        return this.current >= this.source.length;
    }

    advance() {
        const c = this.source[this.current];
        this.current++;
        return c;
    }

    peek() {
        if (this.isAtEnd()) return '\0';
        return this.source[this.current];
    }

    peekNext() {
        if (this.current + 1 >= this.source.length) return '\0';
        return this.source[this.current + 1];
    }

    match(expected: string) {
        if (this.isAtEnd()) return false;
        if (this.source[this.current] != expected) return false;

        this.current++;
        return true;
    }

    addToken(type: TokenType, literal: Variable = null) {
        const text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal, this.line));
    }
}