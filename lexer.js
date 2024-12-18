class Lexer {
    constructor(source) {
        this.source = source;
        this.tokens = [];
        this.current = 0;
        this.keywords = ['let', 'func', 'return', 'if', 'then', 'else', 'while', 'try', 'catch', 'print'];
    }

    tokenize() {
        while (this.current < this.source.length) {
            let char = this.source[this.current];
            if (/\s/.test(char)) {
                this.current++;
            } else if (/[0-9]/.test(char)) {
                this.tokenizeNumber();
            } else if (/[a-zA-Z]/.test(char)) {
                this.tokenizeIdentifier();
            } else if (char === '"') {
                this.tokenizeString();
            } else {
                this.tokenizeSymbol(char);
            }
        }
        return this.tokens;
    }

    tokenizeNumber() {
        let number = '';
        while (/[0-9]/.test(this.source[this.current])) {
            number += this.source[this.current++];
        }
        this.tokens.push({ type: 'NUMBER', value: parseInt(number) });
    }

    tokenizeIdentifier() {
        let identifier = '';
        while (/[a-zA-Z]/.test(this.source[this.current])) {
            identifier += this.source[this.current++];
        }
        if (this.keywords.includes(identifier)) {
            this.tokens.push({ type: identifier.toUpperCase() });
        } else {
            this.tokens.push({ type: 'IDENTIFIER', value: identifier });
        }
    }

    tokenizeString() {
        let str = '';
        this.current++; // skip opening quote
        while (this.current < this.source.length && this.source[this.current] !== '"') {
            str += this.source[this.current++];
        }
        this.current++; // skip closing quote
        this.tokens.push({ type: 'STRING', value: str });
    }

    tokenizeSymbol(char) {
        switch (char) {
            case '=': this.tokens.push({ type: 'EQUAL' }); break;
            case '+': this.tokens.push({ type: 'PLUS' }); break;
            case '-': this.tokens.push({ type: 'MINUS' }); break;
            case '*': this.tokens.push({ type: 'STAR' }); break;
            case '/': this.tokens.push({ type: 'SLASH' }); break;
            case '(': this.tokens.push({ type: 'LPAREN' }); break;
            case ')': this.tokens.push({ type: 'RPAREN' }); break;
            case '{': this.tokens.push({ type: 'LBRACE' }); break;
            case '}': this.tokens.push({ type: 'RBRACE' }); break;
            case ',': this.tokens.push({ type: 'COMMA' }); break;
            case '>': this.tokens.push({ type: 'GREATER' }); break;
            case '<': this.tokens.push({ type: 'LESS' }); break;
            case '!': this.tokens.push({ type: 'BANG' }); break;
            case '&': this.tokens.push({ type: 'AMPERSAND' }); break;
            case '|': this.tokens.push({ type: 'PIPE' }); break;
            default: throw new Error(`Unexpected character: ${char}`);
        }
        this.current++;
    }
}


module.exports = { Lexer };