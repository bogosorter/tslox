import Token from './token';

export default class RuntimeError extends Error {
    token: Token;
    message: string;

    constructor(token: Token, message: string) {
        super(message);
        this.token = token;
        this.message = message;
    }
}
