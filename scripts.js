// @ts-check
class Calculator {
    /**
     * @param {HTMLElement} container
     */
    constructor(container) {
        this.container = container;
        this.operator = '';
        this.typedNumber = '0';
        this.reset = false;
        /** @type {number | undefined} */
        this.operandLeft = undefined;
        /** @type {number | undefined} */
        this.operandRight = undefined;
        /** @type {number | undefined} */
        this.result = undefined;
    }

    static buttonClass = [
        ['btn-ac', 'AC'],
        ['btn-operator', '/'],
        ['btn-operator', 'x'],
        ['btn-del', 'DEL'],
        ['btn-num', '7'],
        ['btn-num', '8'],
        ['btn-num', '9'],
        ['btn-percentage', '%'],
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
        ['btn-dot', '.'],
        ['btn-equal', '=']
    ];
}

class DisplayCalculator extends Calculator {
    static SCALE = 1.15;
    static WIDTH = 290 * DisplayCalculator.SCALE;
    static HEIGHT = 560 * DisplayCalculator.SCALE;

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
            button.classList.add(Calculator.buttonClass[i][0]);
            button.dataset.value = Calculator.buttonClass[i][1];
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
            button.textContent = Calculator.buttonClass[i][1];
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

        // Styling: height, width, font-size
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

    enableClickButton() {
        this.buttons.forEach(button => {
            /** @type {string | undefined} */
            let value = button.dataset.value;

            let calculationField = this.container.querySelector('.calculations');
            let resultField = this.container.querySelector('.result');

            if (button.classList.contains('btn-num')) {
                button.addEventListener('click', () => {
                    this.#handleAssignNumber(value)
                    DisplayCalculator.displayNumber(this.typedNumber, resultField);
                })

            } else if (button.classList.contains('btn-operator')) {
                button.addEventListener('click', () => {
                    this.#handleOperator(value)
                    DisplayCalculator.displayCalculation(this.operandLeft, '',
                        this.operator, calculationField);
                })

            } else if (button.classList.contains('btn-equal')) {
                button.addEventListener('click', () => {
                    if (this.#checkEqualButton()) {
                        this.operandRight = Number(this.typedNumber);
                        this.#handleEqualButton(this.operandLeft, this.operandRight);

                        DisplayCalculator.displayCalculation(this.operandLeft, this.operandRight,
                            this.operator, calculationField);
                        DisplayCalculator.displayNumber(this.result, resultField);

                        this.operandLeft = Number(this.result);
                    }
                })

            } else if (button.classList.contains('btn-ac')) {
                button.addEventListener('click', () => {
                    this.#handleAC();
                    DisplayCalculator.displayClear(calculationField, resultField);
                })

            } else if (button.classList.contains('btn-del')) {
                button.addEventListener('click', () => {
                    this.#handleDEL();
                    DisplayCalculator.displayNumber(this.typedNumber, resultField);
                })

            } else if (button.classList.contains('btn-percentage')) {
                button.addEventListener('click', () => {
                    this.#handlePercentage();
                    DisplayCalculator.displayNumber(this.typedNumber, resultField);
                })

            } else if (button.classList.contains('btn-dot')) {
                button.addEventListener('click', () => {
                    this.#handleDot();
                    DisplayCalculator.displayNumber(this.typedNumber, resultField);
                })
            }
        })
    }

    #handleAssignNumber(value) {
        if ((!Number(this.typedNumber) || this.reset) && this.typedNumber !== '0.') {
            this.typedNumber = value;
            this.reset = false;
        } else {
            this.typedNumber = this.typedNumber + value; //append string
            this.reset = false;
        }
    }

    #handleOperator(value) {
        this.operandLeft = this.operandLeft ? this.operandLeft : Number(this.typedNumber);
        this.operator = value;
        this.reset = true;
        this.typedNumber = '';
    }

    #checkEqualButton() {
        return this.typedNumber !== ''
            && this.operator !== ''
            && this.operandLeft !== undefined
    }

    #handleEqualButton(a, b) {
        if (this.operator === '+') {
            this.result = Operator.add(a, b);
        } else if (this.operator === '-') {
            this.result = Operator.subtract(a, b);
        } else if (this.operator === 'x') {
            this.result = Operator.multiply(a, b);
        } else if (this.operator === '/') {
            this.result = Operator.divide(a, b);
        }
    }

    #handleAC() {
        this.typedNumber = '0';
        this.operandLeft = undefined;
        this.operandRight = undefined;
        this.reset = false;
        this.result = undefined;
    }

    #handleDEL() {
        this.typedNumber = this.typedNumber.slice(0, -1);
        if (this.typedNumber === '') {
            this.typedNumber = '0';
        }
    }

    #handlePercentage() {
        this.typedNumber = String(Number(this.typedNumber) / 100);
    }

    #handleDot() {
        this.typedNumber = this.typedNumber + '.';
    }
}

class Operator {
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
calculator.enableClickButton();