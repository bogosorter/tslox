import { Binary, Grouping, Literal, Unary } from './expressions';
import { ExpressionStatement, PrintStatement } from './statements';

export interface ExpressionVisitor<T> {
    // Expressions
    visitBinaryExpression(expression: Binary): T;
    visitGroupingExpression(expression: Grouping): T;
    visitLiteralExpression(expression: Literal): T;
    visitUnaryExpression(expression: Unary): T;
}

export interface StatementVisitor<T> {
    // Statements
    visitExpressionStatement(statement: ExpressionStatement): T;
    visitPrintStatement(statement: PrintStatement): T;
}
