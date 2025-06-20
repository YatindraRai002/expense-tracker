class ExpenseTracker {
  constructor() {
    this.expenses = [];
    this.categories = {
      food: { name: 'Food', color: '#d97706' },
      transport: { name: 'Transport', color: '#2563eb' },
      shopping: { name: 'Shopping', color: '#db2777' },
      entertainment: { name: 'Entertainment', color: '#059669' },
      healthcare: { name: 'Healthcare', color: '#7c3aed' },
      household: { name: 'Household Resources', color: '#dc2626' },
      others: { name: 'Others', color: '#6b7280' }
    };
    this.init();
  }

  init() {
    document.getElementById('add-expense-btn').addEventListener('click', () => this.addExpense());
    document.getElementById('expense-amount').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addExpense();
    });
    this.render();
  }

  addExpense() {
    const desc = document.getElementById('expense-description').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;

    const errors = this.validateExpenseData(desc, amount, category);
    if (errors.length) {
      this.showError(errors[0]);
      return;
    }

    const expense = {
      id: Date.now(),
      description: desc,
      amount,
      category,
      date: new Date().toISOString().split('T')[0]
    };

    this.expenses.unshift(expense);
    this.render();
    this.clearForm();
    this.showSuccess(`Added ₹${amount.toLocaleString()} expense successfully!`);
  }

  deleteExpense(id) {
    const index = this.expenses.findIndex(exp => exp.id === id);
    if (index !== -1) {
      const deleted = this.expenses.splice(index, 1)[0];
      this.render();
      this.showSuccess(`Deleted ₹${deleted.amount.toLocaleString()} expense`);
    }
  }

  clearForm() {
    document.getElementById('expense-description').value = '';
    document.getElementById('expense-amount').value = '';
  }

  calculateTotal() {
    return this.expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  getCategoryTotals() {
    const totals = {};
    this.expenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return totals;
  }

  getAnalytics() {
    const dates = [...new Set(this.expenses.map(e => e.date))];
    const total = this.calculateTotal();
    return {
      avgDaily: dates.length ? Math.round(total / dates.length) : 0,
      transactionCount: this.expenses.length,
      highestExpense: this.expenses.length ? Math.max(...this.expenses.map(e => e.amount)) : 0,
      daysTracked: dates.length
    };
  }

  drawDonutChart() {
    const svg = document.getElementById('donut-svg');
    svg.innerHTML = '';

    const totals = this.getCategoryTotals();
    const total = this.calculateTotal();
    if (!total) return;

    const radius = 80;
    const strokeWidth = 20;
    const center = 100;
    let angle = 0;

    for (let [cat, val] of Object.entries(totals)) {
      const slice = val / total * 2 * Math.PI;
      const x1 = center + (radius - strokeWidth / 2) * Math.cos(angle);
      const y1 = center + (radius - strokeWidth / 2) * Math.sin(angle);
      const x2 = center + (radius - strokeWidth / 2) * Math.cos(angle + slice);
      const y2 = center + (radius - strokeWidth / 2) * Math.sin(angle + slice);
      const largeArc = slice > Math.PI ? 1 : 0;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x1} ${y1} A ${radius - strokeWidth / 2} ${radius - strokeWidth / 2} 0 ${largeArc} 1 ${x2} ${y2}`);
      path.setAttribute('stroke', this.categories[cat].color);
      path.setAttribute('stroke-width', strokeWidth);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      svg.appendChild(path);
      angle += slice;
    }
  }

  renderCategorySummary() {
    const el = document.getElementById('category-summary');
    const totals = this.getCategoryTotals();

    if (!Object.keys(totals).length) {
      el.innerHTML = '<div style="text-align:center;padding:40px;color:#666;">No expenses yet.</div>';
      return;
    }

    el.innerHTML = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([cat, val]) => `
        <div class="category-item">
          <div class="category-info">
            <div class="category-icon ${cat}"></div>
            <div class="category-details">
              <h4>${this.categories[cat].name}</h4>
              <span>${this.expenses.filter(e => e.category === cat).length} transactions</span>
            </div>
          </div>
          <div class="category-amount">₹${val.toLocaleString()}</div>
        </div>
      `).join('');
  }

  renderTransactions() {
    const el = document.getElementById('transactions-list');
    if (!this.expenses.length) {
      el.innerHTML = '<div style="text-align:center;padding:40px;color:#666;">No transactions yet.</div>';
      return;
    }

    el.innerHTML = this.expenses.slice(0, 10).map(e => `
      <div class="transaction-item">
        <div class="transaction-info">
          <div class="transaction-icon ${e.category}"></div>
          <div class="transaction-details">
            <h4>${e.description}</h4>
            <span>${this.categories[e.category].name} • ${e.date}</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;">
          <div class="transaction-amount">₹${e.amount.toLocaleString()}</div>
          <button class="delete-btn" onclick="tracker.deleteExpense(${e.id})">×</button>
        </div>
      </div>
    `).join('');
  }

  renderAnalytics() {
    const a = this.getAnalytics();
    document.getElementById('avg-daily').textContent = a.avgDaily.toLocaleString();
    document.getElementById('transaction-count').textContent = a.transactionCount;
    document.getElementById('highest-expense').textContent = a.highestExpense.toLocaleString();
    document.getElementById('days-tracked').textContent = a.daysTracked;
  }

  render() {
    document.getElementById('total-display').textContent = this.calculateTotal().toLocaleString();
    this.drawDonutChart();
    this.renderCategorySummary();
    this.renderTransactions();
    this.renderAnalytics();
  }

  validateExpenseData(desc, amount, category) {
    const errs = [];
    if (!desc || desc.length < 2) errs.push("Description too short");
    if (!amount || amount <= 0) errs.push("Enter a valid amount");
    if (!category || !this.categories[category]) errs.push("Select a valid category");
    return errs;
  }

  showError(msg) {
    const div = document.createElement('div');
    div.textContent = msg;
    div.style.cssText = `position:fixed;top:20px;right:20px;background:#ef4444;color:#fff;padding:10px 16px;border-radius:6px;z-index:1000;`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  }

  showSuccess(msg) {
    const div = document.createElement('div');
    div.textContent = msg;
    div.style.cssText = `position:fixed;top:20px;right:20px;background:#10b981;color:#fff;padding:10px 16px;border-radius:6px;z-index:1000;`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2000);
  }
}

const tracker = new ExpenseTracker();
