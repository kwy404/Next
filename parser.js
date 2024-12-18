class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }

    parse() {
        const statements = [];
        while (this.current < this.tokens.length) {
            statements.push(this.statement());
        }
        return statements;
    }

    statement() {
        const token = this.currentToken();
        switch (token.type) {
            case 'LET':
                return this.variableDeclaration();
            case 'FUNC':
                return this.functionDeclaration();
            case 'IF':
                return this.ifStatement();
            case 'WHILE':
                return this.whileStatement();
            case 'TRY':
                return this.tryStatement();
            case 'PRINT':
                return this.printStatement();
            case 'RETURN':
                return this.returnStatement();
            default:
                return this.expression();
        }
    }

    variableDeclaration() {
        this.advance(); // skip 'let'
        const name = this.currentToken().value;
        this.advance(); // skip variable name
        this.consume('EQUAL', "Expect '=' after variable name.");
        const initializer = this.expression();
        return { type: 'VariableDeclaration', name, initializer };
    }

    functionDeclaration() {
        this.advance(); // skip 'func'
        const name = this.currentToken().value;
        this.advance(); // skip function name
        this.consume('LPAREN', "Expect '(' after function name.");
        const params = [];
        if (!this.check('RPAREN')) {
            do {
                params.push(this.currentToken().value);
                this.advance();
            } while (this.match('COMMA'));
        }
        this.consume('RPAREN', "Expect ')' after parameters.");
        this.consume('LBRACE', "Expect '{' before function body.");
        const body = this.block();
        this.consume('RBRACE', "Expect '}' after function body.");
        return { type: 'FunctionDeclaration', name, params, body };
    }

    ifStatement() {
        this.advance(); // skip 'if'
        const condition = this.expression();
        this.consume('THEN', "Expect 'then' after condition.");
        this.consume('LBRACE', "Expect '{' before then branch.");
        const thenBranch = this.block();
        this.consume('RBRACE', "Expect '}' after then branch.");
        let elseBranch = null;
        if (this.match('ELSE')) {
            this.consume('LBRACE', "Expect '{' before else branch.");
            elseBranch = this.block();
            this.consume('RBRACE', "Expect '}' after else branch.");
        }
        return { type: 'IfStatement', condition, thenBranch, elseBranch };
    }

    whileStatement() {
        this.advance(); // skip 'while'
        const condition = this.expression();
        this.consume('LBRACE', "Expect '{' before while body.");
        const body = this.block();
        this.consume('RBRACE', "Expect '}' after while body.");
        return { type: 'WhileStatement', condition, body };
    }

    tryStatement() {
        this.advance(); // skip 'try'
        this.consume('LBRACE', "Expect '{' before try block.");
        const tryBlock = this.block();
        this.consume('RBRACE', "Expect '}' after try block.");
        this.consume('CATCH', "Expect 'catch' after try block.");
        this.consume('LBRACE', "Expect '{' before catch block.");
        const catchBlock = this.block();
        this.consume('RBRACE', "Expect '}' after catch block.");
        return { type: 'TryStatement', tryBlock, catchBlock };
    }

    printStatement() {
        this.advance(); // skip 'print'
        const argument = this.expression();
        return { type: 'PrintStatement', argument };
    }

    returnStatement() {
        this.advance(); // skip 'return'
        const argument = this.expression();
        return { type: 'ReturnStatement', argument };
    }

    block() {
        const statements = [];
        while (!this.check('RBRACE') && !this.isAtEnd()) {
            statements.push(this.statement());
        }
        return statements;
    }

    expression() {
        return this.equality();
    }

    equality() {
        let expr = this.comparison();
        while (this.match('EQUAL', 'BANG')) {
            let operator = this.previous();
            let right = this.comparison();
            expr = { type: 'BinaryExpression', left: expr, operator: operator.type, right: right };
        }
        return expr;
    }

    comparison() {
        let expr = this.term();
        while (this.match('GREATER', 'LESS')) {
            let operator = this.previous();
            let right = this.term();
            expr = { type: 'BinaryExpression', left: expr, operator: operator.type, right: right };
        }
        return expr;
    }

    term() {
        let expr = this.factor();
        while (this.match('PLUS', 'MINUS')) {
            let operator = this.previous();
            let right = this.factor();
            expr = { type: 'BinaryExpression', left: expr, operator: operator.type, right: right };
        }
        return expr;
    }

    factor() {
        let expr = this.unary();
        while (this.match('STAR', 'SLASH')) {
            let operator = this.previous();
            let right = this.unary();
            expr = { type: 'BinaryExpression', left: expr, operator: operator.type, right: right };
        }
        return expr;
    }

    unary() {
        if (this.match('MINUS', 'BANG')) {
            let operator = this.previous();
            let right = this.unary();
            return { type: 'UnaryExpression', operator: operator.type, right: right };
        }
        return this.primary();
    }

    primary() {
        if (this.match('NUMBER')) {
            return { type: 'Literal', value: this.previous().value };
        }
        if (this.match('STRING')) {
            return { type: 'Literal', value: this.previous().value };
        }
        if (this.match('IDENTIFIER')) {
            const name = this.previous().value;
            if (this.match('LPAREN')) {
                return this.functionCall(name);
            }
            return { type: 'Identifier', name };
        }
        if (this.match('LPAREN')) {
            const expr = this.expression();
            this.consume('RPAREN', "Expect ')' after expression.");
            return { type: 'Grouping', expression: expr };
        }
        throw new Error(`Unexpected token: ${this.currentToken().type}`);
    }

    functionCall(callee) {
        const args = [];
        if (!this.check('RPAREN')) {
            do {
                args.push(this.expression());
            } while (this.match('COMMA'));
        }
        this.consume('RPAREN', "Expect ')' after arguments.");
        return { type: 'FunctionCall', callee, args };
    }

    match(...types) {
        for (const type of types) {
            if (this.check(type)) {
                this.current++;
                return true;
            }
        }
        return false;
    }

    consume(type, message) {
        if (this.check(type)) return this.advance();
        throw new Error(message);
    }

    check(type) {
        if (this.isAtEnd()) return false;
        return this.currentToken().type === type;
    }

    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    isAtEnd() {
        return this.current >= this.tokens.length;
    }

    currentToken() {
        return this.tokens[this.current];
    }

    previous() {
        return this.tokens[this.current - 1];
    }
}


module.exports = { Parser };