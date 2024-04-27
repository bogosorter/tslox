import { TokenType, Variable } from './types';

export default class Token {
    type: TokenType;
    lexeme: string;
    literal: Variable;
    line: number;

    constructor(type: TokenType, lexeme: string, literal: Variable, line: number) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    toString() {
        return `${this.type} ${this.lexeme} ${this.literal}`;
    }
}