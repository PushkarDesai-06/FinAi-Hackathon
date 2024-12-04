class ExpenseTracker {
  constructor() {
    this.username = localStorage.getItem('currentUsername');
    this.expenses = [];
    this.loadExpenses();
    this.initializeChart();
    this.setupEventListeners();
    document.addEventListener('DOMContentLoaded', () => {
      this.updateUI();
    });
  }

  async loadExpenses() {
    try {
      const response = await fetch(`http://localhost:8000/expenses/${this.username}`);
      const data = await response.json();
      this.expenses = data.expenses;
      this.updateUI();
      this.updateChart();
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  }

  initializeChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.getLast7Days(),
        datasets: [{
          label: 'Daily Expenses (₹)',
          data: this.getDailyTotals(),
          borderColor: '#426b1f',
          backgroundColor: 'transparent',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Allows the chart to resize based on container
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Amount (₹)'
            }
          }
        }
      }
    });
  }

  setupEventListeners() {
    const form = document.getElementById('expenseForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const amount = document.getElementById('amount').value;
      const description = document.getElementById('description').value;
      const date = document.getElementById('expenseDate').value; // Get the selected date

      const expense = {
        username: this.username,
        amount: Number(amount),
        description: description,
        date: new Date(date).toISOString() // Convert to ISO format
      };

      try {
        const response = await fetch('http://localhost:8000/expenses/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(expense)
        });

        const result = await response.json();
        if (result.result === 'true') {
          this.loadExpenses(); // Reload expenses from server
          form.reset(); // Clear the form
        } else {
          console.error('Error adding expense:', result.error);
        }
      } catch (error) {
        console.error('Error adding expense:', error);
      }
    });
  }

  addExpense(expense) {
    this.expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(this.expenses));
    this.updateUI();
    this.updateChart();
  }

  getDailyTotals() {
    const days = this.getLast7Days();
    return days.map(day => {
      return this.expenses
        .filter(exp => exp.date.startsWith(day))
        .reduce((sum, exp) => sum + exp.amount, 0);
    });
  }

  getLast7Days() {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - i + 1); // start from today and go back 6 days
      return d.toISOString().split('T')[0];
    }).reverse();
  }

  updateUI() {
    const today = new Date().toISOString().split('T')[0];
    const dailyTotal = this.expenses
      .filter(exp => exp.date.startsWith(today))
      .reduce((sum, exp) => sum + exp.amount, 0);
    const dailyTotalElement = document.getElementById('dailyTotal');
    if (dailyTotalElement) {
      dailyTotalElement.textContent = dailyTotal.toFixed(2);
    } else {
      console.error('Element with id "dailyTotal" not found');
    }
  }

  updateChart() {
    this.chart.data.datasets[0].data = this.getDailyTotals();
    this.chart.update();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ExpenseTracker();
});