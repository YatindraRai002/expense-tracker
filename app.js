const expenseDescription = document.getElementById('expense-description');
const expenseAmount = document.getElementById('expense-amount');
const addExpenseBtn = document.getElementById('add-expense-btn');
const expenseList = document.getElementById('expense-list');
const totalAmountDisplay = document.getElementById('total-amount');

let totalAmount = 0;
let expenses = [];


function loadData() {
  const storedExpenses = localStorage.getItem('expenses');
  const storedTotalAmount = localStorage.getItem('totalAmount');

  if (storedExpenses) {
    expenses = JSON.parse(storedExpenses);
    expenses.forEach(expense => {
      const expenseItem = document.createElement('li');
      expenseItem.innerHTML = `
        ${expense.description} - ₹${expense.amount.toFixed(2)}
        <button class="delete-btn" onclick="deleteExpense(${expenses.indexOf(expense)})">Delete</button>
      `;
      expenseList.appendChild(expenseItem);
    });
  }

  if (storedTotalAmount) {
    totalAmount = parseFloat(storedTotalAmount);
    updateTotalAmount();
  }
}


function saveData() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
  localStorage.setItem('totalAmount', totalAmount.toFixed(2));
}

function updateTotalAmount() {
  totalAmountDisplay.textContent = totalAmount.toFixed(2);
}

function addExpense() {
  const description = expenseDescription.value.trim();
  const amount = parseFloat(expenseAmount.value);

  if (!description || isNaN(amount) || amount <= 0) {
    alert('Please enter valid expense details!');
    return;
  }

  const newExpense = {
    description: description,
    amount: amount,
  };

  expenses.push(newExpense);
  totalAmount += amount;

  expenseDescription.value = '';
  expenseAmount.value = '';

  const expenseItem = document.createElement('li');
  expenseItem.innerHTML = `
    ${description} - ₹${amount.toFixed(2)}
    <button class="delete-btn" onclick="deleteExpense(${expenses.length - 1})">Delete</button>
  `;

  expenseList.appendChild(expenseItem);

  updateTotalAmount();
  saveData(); 
}

function deleteExpense(index) {
  totalAmount -= expenses[index].amount;

  expenses.splice(index, 1);

  expenseList.removeChild(expenseList.children[index]);

  updateTotalAmount();
  saveData(); 
}


window.onload = loadData;

addExpenseBtn.addEventListener('click', addExpense);
