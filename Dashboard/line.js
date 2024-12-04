import Chart from 'chart.js/auto';

document.addEventListener('DOMContentLoaded', function () {
  const chartContainer = document.getElementById('chartContainer');
  const canvas = document.createElement('canvas');
  canvas.id = 'myChart';
  chartContainer.appendChild(canvas);
});

class ExpenseTracker {
  constructor() {
    this.expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    this.initializeChart();
    this.setupEventListeners();
    this.updateUI();
  }

  initializeChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.getLast7Days(),
        datasets: [{
          label: 'Daily Expenses',
          data: this.getDailyTotals(),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'transparent',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  setupEventListeners() {
    document.getElementById('expenseForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addExpense({
        amount: Number(document.getElementById('amount').value),
        description: document.getElementById('description').value,
        date: new Date().toISOString()
      });
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
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();
  }

  updateUI() {
    const today = new Date().toISOString().split('T')[0];
    const dailyTotal = this.expenses
      .filter(exp => exp.date.startsWith(today))
      .reduce((sum, exp) => sum + exp.amount, 0);
    document.getElementById('dailyTotal').textContent = dailyTotal.toFixed(2);
  }

  updateChart() {
    this.chart.data.datasets[0].data = this.getDailyTotals();
    this.chart.update();
  }
}

new ExpenseTracker();