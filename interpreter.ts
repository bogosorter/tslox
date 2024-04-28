import Environment from './environment';
import { Expression, Binary, Grouping, Literal, Unary, VariableExpression, Assignement } from './expressions';
import Token from './token';
import { ExpressionVisitor, StatementVisitor } from './visitor';
import RuntimeError from './runtimeError';
import { Variable, TokenType } from './types';
import { Statement, ExpressionStatement, PrintStatement, VariableDeclaration, Block } from './statements';

export default class Interpreter implements ExpressionVisitor<Variable>, StatementVisitor<void> {

    environment: Environment = new Environment();

    interpret(statements: Statement[], reportError: (error: RuntimeError) => void) {
        try {
            for (const statement of statements) this.execute(statement);
        } catch (error) {
            if (error instanceof RuntimeError) reportError(error);
            else throw error;
        }
    }

    visitBinaryExpression(expression: Binary): Variable {
        const left = this.evaluate(expression.left);
        const right = this.evaluate(expression.right);

        if (expression.operator.type == TokenType.PLUS) {
            if (typeof left == 'number' && typeof right == 'number') return left + right;
            if (typeof left == 'string' && typeof right == 'string') return left + right;
            throw new RuntimeError(expression.operator, `Operands for '+' must be two numbers or two strings`);
        }

        if (expression.operator.type == TokenType.BANG_EQUAL) return left !== right;
        if (expression.operator.type == TokenType.EQUAL_EQUAL) return left === right;

        const [l, r] = this.checkNumberOperands(expression.operator, left, right);
        if (expression.operator.type == TokenType.MINUS) return l - r;
        if (expression.operator.type == TokenType.SLASH) {
            if (r == 0) throw new RuntimeError(expression.operator, 'Division by zero.');
            return l / r;
        }
        if (expression.operator.type == TokenType.STAR) return l * r;
        if (expression.operator.type == TokenType.GREATER) return l > r;
        if (expression.operator.type == TokenType.GREATER_EQUAL) return l >= r;
        if (expression.operator.type == TokenType.LESS) return l < r;
        if (expression.operator.type == TokenType.LESS_EQUAL) return l <= r;

        return null;
    }

    visitGroupingExpression(expression: Grouping) {
        return this.evaluate(expression.expression);
    }

    visitUnaryExpression(expression: Unary): Variable {
        const right = this.evaluate(expression.right);
        if (expression.operator.type == TokenType.MINUS) {
            const r = this.checkNumberOperand(expression.operator, right);
            return -r;
        }
        if (expression.operator.type == TokenType.BANG) return !this.isTruthy(right);
        return null;
    }

    visitLiteralExpression(expression: Literal) {
        return expression.value;
    }

    visitExpressionStatement(statement: ExpressionStatement): void {
        this.evaluate(statement.expression);
    }

    visitPrintStatement(statement: PrintStatement): void {
        const value = this.evaluate(statement.expression);
        console.log(this.stringify(value));
    }

    visitVariableDeclaration(statement: VariableDeclaration): void {
        const value = this.evaluate(statement.initializer);
        this.environment.define(statement.name, value);
    }

    visitVariableExpression(expression: VariableExpression): Variable {
        return this.environment.get(expression.name);
    }

    visitAssignementExpression(expression: Assignement): Variable {
        const value = this.evaluate(expression.value);
        this.environment.assign(expression.name, value);
        return value;
    }

    visitBlockStatement(statement: Block): void {
        this.executeBlock(statement.statements, new Environment(this.environment));
    }

    executeBlock(statements: Statement[], environment: Environment) {
        const previous = this.environment;
        try {
            this.environment = environment;
            for (const statement of statements) this.execute(statement);
        } finally {
            this.environment = previous;
        }
    }

    evaluate(expression: Expression): Variable {
        return expression.accept<Variable>(this);
    }

    execute(statement: Statement) {
        statement.accept<void>(this);
    }

    isTruthy(variable: Variable) {
        if (variable === null || variable === false) return false;
        return true;
    }

    checkNumberOperand(operator: Token, operand: Variable) {
        if (typeof operand == 'number') return operand;
        throw new RuntimeError(operator, `Operand for ${operator.literal} must be a number.`);
    }

    checkNumberOperands(operator: Token, left: Variable, right: Variable) {
        if (typeof left == 'number' && typeof right == 'number') return [left, right] as const;
        throw new RuntimeError(operator, `Operands for ${operator.literal} must be numbers.`);
    }

    stringify(value: Variable) {
        if (value === null) return 'nil';
        return value.toString();
    }
}
