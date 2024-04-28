import { Binary, Grouping, Literal, Unary, VariableExpression, Assignement } from './expressions';
import { ExpressionStatement, PrintStatement, VariableDeclaration, Block } from './statements';

export interface ExpressionVisitor<T> {
    visitBinaryExpression(expression: Binary): T;
    visitGroupingExpression(expression: Grouping): T;
    visitLiteralExpression(expression: Literal): T;
    visitUnaryExpression(expression: Unary): T;
    visitVariableExpression(expression: VariableExpression): T;
    visitAssignementExpression(expression: Assignement): T;
}

export interface StatementVisitor<T> {
    visitExpressionStatement(statement: ExpressionStatement): T;
    visitPrintStatement(statement: PrintStatement): T;
    visitVariableDeclaration(statement: VariableDeclaration): T;
    visitBlockStatement(statement: Block): T;
}
