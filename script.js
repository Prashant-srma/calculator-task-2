const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const themeBtn = document.getElementById("themeBtn");

let expression = "";
let justCalculated = false;

function updateDisplay() {
  expressionEl.textContent = expression
    .replaceAll("*", " × ")
    .replaceAll("/", " ÷ ")
    .replaceAll("+", " + ")
    .replaceAll("-", " − ");

  if (!expression) {
    resultEl.textContent = "0";
    return;
  }

  try {
    const preview = calculate(expression);
    if (preview !== null && Number.isFinite(preview)) {
      resultEl.textContent = formatNumber(preview);
    } else {
      resultEl.textContent = "0";
    }
  } catch {
    resultEl.textContent = "0";
  }
}

function formatNumber(number) {
  if (Number.isInteger(number)) return number.toString();
  return parseFloat(number.toFixed(10)).toString();
}

function calculate(input) {
  if (!input) return null;

  let clean = input.replace(/%/g, "/100");

  // Only allow calculator characters.
  if (!/^[0-9+\-*/().\s]+$/.test(clean)) {
    throw new Error("Invalid input");
  }

  // Prevent incomplete expressions from being evaluated.
  if (/[+\-*/.]$/.test(clean)) return null;

  // Evaluate only the expression constructed by calculator buttons.
  const value = Function('"use strict"; return (' + clean + ')')();

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("Invalid calculation");
  }

  return value;
}

function addValue(value) {
  if (justCalculated && /[0-9.]/.test(value)) {
    expression = "";
  }
  justCalculated = false;

  const lastChar = expression.slice(-1);

  if ("+-*/".includes(value)) {
    if (!expression) {
      if (value !== "-") return;
    }
    if ("+-*/".includes(lastChar)) {
      expression = expression.slice(0, -1) + value;
    } else {
      expression += value;
    }
  } else if (value === ".") {
    const currentNumber = expression.split(/[+\-*/]/).pop();
    if (currentNumber.includes(".")) return;
    expression += currentNumber ? "." : "0.";
  } else if (value === "%") {
    if (expression && /[0-9)]$/.test(expression)) expression += "%";
  } else {
    expression += value;
  }

  updateDisplay();
}

function clearAll() {
  expression = "";
  justCalculated = false;
  updateDisplay();
}

function deleteLast() {
  expression = expression.slice(0, -1);
  justCalculated = false;
  updateDisplay();
}

function calculateResult() {
  try {
    const value = calculate(expression);
    if (value === null) return;

    expressionEl.textContent = expression
      .replaceAll("*", " × ")
      .replaceAll("/", " ÷ ")
      .replaceAll("+", " + ")
      .replaceAll("-", " − ");

    resultEl.textContent = formatNumber(value);
    expression = formatNumber(value);
    justCalculated = true;
  } catch {
    resultEl.textContent = "Error";
  }
}

document.querySelector(".buttons").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.value !== undefined) {
    addValue(button.dataset.value);
  } else if (button.dataset.action === "clear") {
    clearAll();
  } else if (button.dataset.action === "delete") {
    deleteLast();
  } else if (button.dataset.action === "calculate") {
    calculateResult();
  }
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if ((key >= "0" && key <= "9") || "+-*/.%".includes(key)) {
    event.preventDefault();
    addValue(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculateResult();
  } else if (key === "Backspace") {
    event.preventDefault();
    deleteLast();
  } else if (key === "Escape" || key.toLowerCase() === "c") {
    event.preventDefault();
    clearAll();
  }
});

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeBtn.textContent = document.body.classList.contains("dark") ? "☾" : "☼";
});

updateDisplay();
