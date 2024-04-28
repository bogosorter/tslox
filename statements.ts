import { StatementVisitor } from './visitor';
import { Expression } from './expressions';
import Token from './token';

export abstract class Statement {
    abstract accept<T>(visitor: StatementVisitor<T>): T;
}

export class ExpressionStatement extends Statement {
    expression: Expression;

    constructor(expression: Expression) {
        super();
        this.expression = expression;
    }

    accept<T>(visitor: StatementVisitor<T>): T {
        return visitor.visitExpressionStatement(this);
    }
}

export class PrintStatement extends Statement {
    expression: Expression;

    constructor(expression: Expression) {
        super();
        this.expression = expression;
    }

    accept<T>(visitor: StatementVisitor<T>): T {
        return visitor.visitPrintStatement(this);
    }
}

export class VariableDeclaration extends Statement {
    name: Token;
    initializer: Expression;

    constructor(name: Token, initializer: Expression) {
        super();
        this.name = name;
        this.initializer = initializer;
    }

    accept<T>(visitor: StatementVisitor<T>): T {
        return visitor.visitVariableDeclaration(this);
    }
}

export class Block extends Statement {
    statements: Statement[];

    constructor(statements: Statement[]) {
        super();
        this.statements = statements;
    }

    accept<T>(visitor: StatementVisitor<T>): T {
        return visitor.visitBlockStatement(this);
    }
}
