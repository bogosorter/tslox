import Token from './token';
import { ExpressionVisitor } from './visitor';

export abstract class Expression {
    abstract accept<T>(visitor: ExpressionVisitor<T>): T;
}

export class Binary extends Expression {
    left: Expression;
    operator: Token;
    right: Expression;

    constructor(left: Expression, operator: Token, right: Expression) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitBinaryExpression(this);
    }
}

export class Grouping extends Expression {
    expression: Expression;

    constructor(expression: Expression) {
        super();
        this.expression = expression;
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitGroupingExpression(this);
    }
}

export class Literal extends Expression {
    value: any;

    constructor(value: any) {
        super();
        this.value = value;
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitLiteralExpression(this);
    }
}

export class Unary extends Expression {
    operator: Token;
    right: Expression;

    constructor(operator: Token, right: Expression) {
        super();
        this.operator = operator;
        this.right = right;
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitUnaryExpression(this);
    }
}

export class VariableExpression extends Expression {
    name: Token;

    constructor(name: Token) {
        super();
        this.name = name
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitVariableExpression(this);
    }
}

export class Assignement extends Expression {
    name: Token;
    value: Expression;

    constructor(name: Token, value: Expression) {
        super();
        this.name = name;
        this.value = value;
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitAssignementExpression(this);
    }
}
