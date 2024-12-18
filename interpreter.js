class Interpreter {
    constructor(ast) {
        this.ast = ast;
        this.env = {};
    }

    interpret() {
        try {
            this.ast.forEach(statement => this.execute(statement));
        } catch (e) {
            if (e instanceof ReturnException) {
                return e.value;
            } else {
                throw e;
            }
        }
    }

    execute(node) {
        switch (node.type) {
            case 'VariableDeclaration':
                this.env[node.name] = this.evaluate(node.initializer);
                break;
            case 'FunctionDeclaration':
                this.env[node.name] = node;
                break;
            case 'IfStatement':
                if (this.evaluate(node.condition)) {
                    node.thenBranch.forEach(stmt => this.execute(stmt));
                } else if (node.elseBranch) {
                    node.elseBranch.forEach(stmt => this.execute(stmt));
                }
                break;
            case 'WhileStatement':
                while (this.evaluate(node.condition)) {
                    node.body.forEach(stmt => this.execute(stmt));
                }
                break;
            case 'TryStatement':
                try {
                    node.tryBlock.forEach(stmt => this.execute(stmt));
                } catch (e) {
                    node.catchBlock.forEach(stmt => this.execute(stmt));
                }
                break;
            case 'PrintStatement':
                console.log(this.evaluate(node.argument));
                break;
            case 'ReturnStatement':
                throw new ReturnException(this.evaluate(node.argument));
            case 'FunctionCall':
                const func = this.env[node.callee];
                const args = node.args.map(arg => this.evaluate(arg));
                const localEnv = {};
                func.params.forEach((param, index) => {
                    localEnv[param] = args[index];
                });
                const oldEnv = this.env;
                this.env = { ...this.env, ...localEnv };
                let result;
                try {
                    func.body.forEach(stmt => {
                        result = this.execute(stmt);
                    });
                } catch (e) {
                    if (e instanceof ReturnException) {
                        result = e.value;
                    } else {
                        throw e;
                    }
                }
                this.env = oldEnv;
                return result;
            default:
                throw new Error(`Unknown node type: ${node.type}`);
        }
    }

    evaluate(node) {
        switch (node.type) {
            case 'Literal':
                return node.value;
            case 'Identifier':
                return this.env[node.name];
            case 'FunctionCall':
                return this.execute(node);
            case 'BinaryExpression':
                return this.evaluateBinaryExpression(node);
            case 'UnaryExpression':
                return this.evaluateUnaryExpression(node);
            case 'Grouping':
                return this.evaluate(node.expression);
            default:
                throw new Error(`Unknown node type: ${node.type}`);
        }
    }

    evaluateBinaryExpression(node) {
        const left = this.evaluate(node.left);
        const right = this.evaluate(node.right);
        switch (node.operator) {
            case 'PLUS': return left + right;
            case 'MINUS': return left - right;
            case 'STAR': return left * right;
            case 'SLASH': return left / right;
            case 'GREATER': return left > right;
            case 'LESS': return left < right;
            case 'EQUAL': return left === right;
            case 'BANG': return left !== right;
            default: throw new Error(`Unknown operator: ${node.operator}`);
        }
    }

    evaluateUnaryExpression(node) {
        const right = this.evaluate(node.right);
        switch (node.operator) {
            case 'MINUS': return -right;
            case 'BANG': return !right;
            default: throw new Error(`Unknown operator: ${node.operator}`);
        }
    }
}

class ReturnException {
    constructor(value) {
        this.value = value;
    }
}

module.exports = {Interpreter, ReturnException};