import Token from './token';
import RuntimeError from './runtimeError';
import { Variable } from './types';

export default class Environment {
    enclosing: Environment | null;
    values: { [key: string]: Variable } = {};

    constructor(enclosing: Environment | null = null) {
        this.enclosing = enclosing;
    }

    define(token: Token, value: Variable) {
        this.values[token.lexeme] = value;
    }

    assign(token: Token, value: Variable) {
        if (!(token.lexeme in this.values)) {
            if (this.enclosing) this.enclosing.assign(token, value);
            else throw new RuntimeError(token, `Undefined variable ${token.lexeme}.`);
        }

        this.values[token.lexeme] = value;
    }

    get(token: Token): Variable {
        if (!(token.lexeme in this.values)) {
            if (this.enclosing) return this.enclosing.get(token);
            throw new RuntimeError(token, `Undefined variable ${token.lexeme}.`);
        }

        return this.values[token.lexeme];
    }
}
