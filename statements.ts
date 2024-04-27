import { StatementVisitor } from './visitor';
import { Expression } from './expressions';

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

