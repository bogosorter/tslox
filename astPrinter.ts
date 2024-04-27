import Token from './token';
import { Expression, Binary, Grouping, Literal, Unary } from './expressions';
import { TokenType } from './types';
import Visitor from './visitor';

export default class AstPrinter implements Visitor<string> {
    print(expression: Expression): string {
        return expression.accept(this);
    }

    visitBinaryExpression(expression: Binary): string {
        return this.parenthesize(expression.operator.lexeme, expression.left, expression.right);
    }

    visitGroupingExpression(expression: Grouping): string {
        return this.parenthesize("group", expression.expression);
    }

    visitLiteralExpression(expression: Literal): string {
        if (expression.value == null) return "nil";
        return expression.value.toString();
    }

    visitUnaryExpression(expression: Unary): string {
        return this.parenthesize(expression.operator.lexeme, expression.right);
    }

    private parenthesize(name: string, ...expressions: Expression[]): string {
        let str = `(${name}`;
        for (let expression of expressions) {
            str += ` ${expression.accept(this)}`;
        }
        str += ")";
        return str;
    }
}

const expression = new Binary(
    new Unary(new Token(TokenType.MINUS, "-", null, 1), new Literal(123)),
    new Token(TokenType.STAR, "*", null, 1),
    new Grouping(new Literal(45.67))
);
