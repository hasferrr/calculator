// @ts-check
class Calculator {
    /**
     * @param {HTMLElement} container
     */
    constructor(container) {
        this.container = container;

        /** @type {string | undefined} */
        this.operator = undefined;

        this.result = '0';
        this.operandLeft = 0;
        this.operandRight = 0;
        this.reset = false;
    }
}

class DisplayCalculator extends Calculator {
    static SCALE = 1.15;
    static WIDTH = 290 * DisplayCalculator.SCALE;
    static HEIGHT = 560 * DisplayCalculator.SCALE;
    static buttonClass = [
        ['btn-tool', 'AC'],
        ['btn-operator', '/'],
        ['btn-operator', 'x'],
        ['btn-tool', 'DEL'],
        ['btn-num', '7'],
        ['btn-num', '8'],
        ['btn-num', '9'],
        ['btn-changenum', '%'],
        ['btn-num', '4'],
        ['btn-num', '5'],
        ['btn-num', '6'],
        ['btn-operator', '-'],
        ['btn-num', '1'],
        ['btn-num', '2'],
        ['btn-num', '3'],
        ['btn-operator', '+'],
        ['btn-empty', ''],
        ['btn-num', '0'],
        ['btn-changenum', '.'],
        ['btn-equal', '=']
    ];

    constructor(container) {
        super(container);
        container.style.width = DisplayCalculator.WIDTH + 'px';
        container.style.height = DisplayCalculator.HEIGHT + 'px';
    }

    displayCalculatorScreen() {
        const display = document.createElement('div');
        display.classList.add('display');
        display.style.width = DisplayCalculator.WIDTH + 'px';
        display.style.height = DisplayCalculator.HEIGHT * (1 - 0.625) + 'px';

        this.container.appendChild(display.cloneNode(true));
    }

    displayButton() {
        const row = document.createElement('div');
        row.classList.add('row');
        row.style.width = DisplayCalculator.WIDTH + 'px';
        row.style.height = DisplayCalculator.HEIGHT * 0.625 / 5 + 'px';

        const button = document.createElement('button')
        button.style.width = DisplayCalculator.WIDTH / 4 + 'px';
        button.style.height = DisplayCalculator.HEIGHT * 0.625 / 5 + 'px';

        for (let i = 0; i < 4; i++) {
            row.appendChild(button.cloneNode(true));
        }

        for (let i = 0; i < 5; i++) {
            this.container.appendChild(row.cloneNode(true));
        }

        this.#addClassAndDataAttrButton();
        this.#roundButton();
    }

    #addClassAndDataAttrButton() {
        const buttons = this.container.querySelectorAll('button');
        for (let i = 0; i < buttons.length; i++) {
            let button = buttons[i];
            button.classList.add(DisplayCalculator.buttonClass[i][0]);
            button.dataset.value = DisplayCalculator.buttonClass[i][1];
        }
    }

    #roundButton() {
        const lastRow = this.container.lastElementChild;
        // @ts-ignore
        lastRow.firstElementChild.style.borderBottomLeftRadius = '30px';
        // @ts-ignore
        lastRow.lastElementChild.style.borderBottomRightRadius = '30px';
    }

    displayButtonText() {
        const buttons = this.container.querySelectorAll('button');
        for (let i = 0; i < buttons.length; i++) {
            let button = buttons[i];
            button.textContent = DisplayCalculator.buttonClass[i][1];
        }
    }

    displayCalculationText() {
        const display = document.querySelector('.display');
        const calculations = document.createElement('div');
        const result = document.createElement('div');
        const box = document.createElement('div');

        //@ts-ignore
        const DISPLAY_HEIGHT = Number(display.style.height.slice(0, -2)); //remove 'px'

        calculations.classList.add('calculations');
        result.classList.add('result');

        let height = 80;
        let width = DisplayCalculator.WIDTH / DisplayCalculator.SCALE - 30;

        box.style.height = 20 * DisplayCalculator.SCALE + 'px';
        calculations.style.height = DISPLAY_HEIGHT - height * DisplayCalculator.SCALE + 'px';
        result.style.height = height * DisplayCalculator.SCALE + 'px';

        calculations.style.width = width * DisplayCalculator.SCALE + 'px';
        result.style.width = width * DisplayCalculator.SCALE + 'px';

        calculations.style.fontSize = 18 * DisplayCalculator.SCALE + 'px';
        result.style.fontSize = 42 * DisplayCalculator.SCALE + 'px';

        result.textContent = '0';

        // Append to .display
        display?.appendChild(box);
        display?.appendChild(calculations);
        display?.appendChild(result);
        display?.appendChild(box.cloneNode(true));
    }

    static displayNumber(text, resultField) {
        resultField.textContent = text;
    }

    static displayCalculation(a, b, operator, calculationField) {
        calculationField.textContent = `${a} ${operator} ${b}`;
    }

    static displayClear(calculationField, resultField) {
        calculationField.textContent = '';
        resultField.textContent = '0';
    }
}

class Functionality extends Calculator {
    constructor(container) {
        super(container);
        this.buttons = this.container.querySelectorAll('button');
    }

    enableClickToAssign() {
        this.buttons.forEach(button => {
            let value = button.dataset.value;
            let calculationField = this.container.querySelector('.calculations');
            let resultField = this.container.querySelector('.result');

            if (button.classList.contains('btn-num')) {
                button.addEventListener('click', () => {
                    this.#handleAssignNumber(value)
                    DisplayCalculator.displayNumber(this.result, resultField);
                })

            } else if (button.classList.contains('btn-operator')) {
                button.addEventListener('click', () => {
                    this.#handleAssignOperator(value)
                    DisplayCalculator.displayCalculation(this.operandLeft, '',
                        this.operator, calculationField);
                })

            } else if (button.classList.contains('btn-equal')) {
                button.addEventListener('click', () => {
                    this.#handleEqualButton();
                    DisplayCalculator.displayCalculation(this.operandLeft, this.operandRight,
                        this.operator, calculationField);
                    DisplayCalculator.displayNumber(this.result, resultField);
                    this.operandLeft = Number(this.result);
                })

            } else if (button.classList.contains('btn-tool')) {
                button.addEventListener('click', () => {
                    if (value === 'AC') {
                        this.#handleAC();
                        DisplayCalculator.displayClear(calculationField, resultField);
                    } else {
                        this.#handleDEL()
                        DisplayCalculator.displayNumber(this.result, resultField);
                    }
                })

            } else if (button.classList.contains('btn-changenum')) {
                // todo
            }
        })
    }

    #handleAssignNumber(value) {
        if (!Number(this.result) || this.reset) {
            this.result = value;
            this.reset = false;
        } else {
            this.result = this.result + value; //append string
            this.reset = false;
        }
    }

    #handleAssignOperator(value) {
        this.operandLeft = Number(this.result);
        this.operator = value;
        this.reset = true;
    }

    #handleEqualButton() {
        if (this.result, this.operator, this.operandLeft !== undefined) {
            this.operandRight = Number(this.result);

            if (this.operator === '+') {
                this.result = Operator.operate(Operator.add, this.operandLeft, this.operandRight);
            } else if (this.operator === '-') {
                this.result = Operator.operate(Operator.subtract, this.operandLeft, this.operandRight);
            } else if (this.operator === 'x') {
                this.result = Operator.operate(Operator.multiply, this.operandLeft, this.operandRight);
            } else if (this.operator === '/') {
                this.result = Operator.operate(Operator.divide, this.operandLeft, this.operandRight);
            }
        }
    }

    #handleAC() {
        this.result = '0';
        this.operandLeft = 0;
        this.operandRight = 0;
        this.reset = false;
    }

    #handleDEL() {
        this.result = this.result.slice(0, -1);
    }
}

class Operator {
    /**
     * @param {(arg0: number, arg1: number) => number} f
     * @param {number} a
     * @param {number} b
     */
    static operate(f, a, b) {
        return String(f(a, b));
    }

    static add(a, b) {
        return a + b
    }

    static subtract(a, b) {
        return a - b
    }

    static multiply(a, b) {
        return a * b
    }

    static divide(a, b) {
        return a / b
    }
}


let calculator;
calculator = new DisplayCalculator(document.querySelector('.container'));

calculator.displayCalculatorScreen();
calculator.displayButton();
calculator.displayButtonText();
calculator.displayCalculationText();

calculator = new Functionality(calculator.container);
calculator.enableClickToAssign();