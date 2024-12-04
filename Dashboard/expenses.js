class DetailedExpenses {
    constructor() {
        this.username = localStorage.getItem('currentUsername');
        this.expenses = [];
        this.initializeDetailedChart();
        this.renderExpenseList();
        this.fetchExpenses();
    }

    async fetchExpenses() {
        if (!this.username) {
            console.error('Username not found in localStorage.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/expenses/${this.username}`);
            const data = await response.json();
            if (response.ok) {
                this.expenses = data.expenses;
                this.renderExpenseList();
                this.updateDetailedChart();
                this.renderTodaysTransactions();
            } else {
                console.error('Error fetching expenses:', data.error);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
        }
    }

    renderExpenseList() {
        const container = document.getElementById('expenseItems');
        if (!container) {
            console.error('Expense items container not found.');
            return;
        }

        if (this.expenses.length === 0) {
            container.innerHTML = '<p>No expenses found.</p>';
            return;
        }

        container.innerHTML = this.expenses
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(exp => `
                <div class="border-b py-2 flex justify-between items-center">
                    <div>${exp.description}</div>
                    <div>₹${exp.amount.toFixed(2)} - ${new Date(exp.date).toLocaleDateString()}</div>
                    <button class="delete-button bg-red-500 text-white px-3 py-1 rounded" data-id="${exp.id}">
                        Delete
                    </button>
                </div>
            `).join('');

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (e) => this.handleDelete(e));
        });
    }

    async handleDelete(event) {
        const expenseId = event.target.getAttribute('data-id');
        if (!expenseId) {
            console.error('Expense ID not found.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/expenses/delete/${expenseId}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (result.success) {
                // Refresh the expenses list after deletion
                this.fetchExpenses();
            } else {
                console.error('Error deleting expense:', result.error);
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    }

    renderTodaysTransactions() {
        const container = document.getElementById('todaysTransactions');
        if (!container) {
            console.error('Todays transactions container not found.');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const todaysExpenses = this.expenses.filter(exp => exp.date.startsWith(today));

        if (todaysExpenses.length === 0) {
            container.innerHTML = '<p>No transactions for today.</p>';
            document.getElementById('dailyTotal').textContent = '0.00';
            return;
        }

        container.innerHTML = todaysExpenses
            .map(exp => `
                <div class="border-b py-2 flex justify-between items-center">
                    <div>${exp.description}</div>
                    <div>₹${exp.amount.toFixed(2)} - ${new Date(exp.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <button class="delete-button bg-red-500 text-white px-3 py-1 rounded" data-id="${exp.id}">
                        Delete
                    </button>
                </div>
            `).join('');

        // Update Today's Total
        const dailyTotal = todaysExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        document.getElementById('dailyTotal').textContent = dailyTotal.toFixed(2);

        // Add event listeners to delete buttons for today's expenses
        document.querySelectorAll('#todaysTransactions .delete-button').forEach(button => {
            button.addEventListener('click', (e) => this.handleDelete(e));
        });
    }

    initializeDetailedChart() {
        const ctx = document.getElementById('detailedChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.getLast30Days(),
                datasets: [{
                    label: 'Daily Expenses',
                    data: [], // Will be populated after fetching expenses
                    borderColor: '#426b1f',
                    backgroundColor: 'rgba(66, 107, 31 , 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateDetailedChart() {
        const dailyTotals = this.getMonthlyTotals();
        console.log('dailyTotals:', dailyTotals[dailyTotals.length-1]);
        this.chart.data.datasets[0].data = dailyTotals;
        this.chart.update();
        const todaysum = document.querySelector('#dailyTotal')
        const todaysumvalue =document.createElement('span')
        todaysumvalue.textContent = dailyTotals[dailyTotals.length-1]
        todaysum.appendChild(todaysumvalue)
    }
    getLast30Days() {
        const today = new Date();
        return Array.from({ length: 30 }, (_, i) => {
          const d = new Date(today);
          d.setDate(d.getDate() - i + 1); // start from today and go back 29 days
          return d.toISOString().split('T')[0];
        }).reverse();
      }

    getMonthlyTotals() {
        const days = this.getLast30Days();
        return days.map(day => {
            return this.expenses
                .filter(exp => exp.date.startsWith(day))
                .reduce((sum, exp) => sum + exp.amount, 0);
        });
    }
}

document.getElementById('chatbotSend').addEventListener('click', async () => {
    const userInput = document.getElementById('expenseDescription').value.trim();
    console.log(userInput);
    if (userInput) {
        // Display user message in the chat
        displayMessage(userInput, 'user');
        document.getElementById('expenseDescription').value = '';  // Clear input field

        // Send user input to FastAPI backend for chatbot response
        const response = await fetch('http://127.0.0.1:8000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userInput, username: localStorage.getItem('currentUsername') }),
        });

        const data = await response.json();
        const botResponse = data.response;

        // Display chatbot response in the chat
        displayMessage(botResponse, 'bot');
    }
});


// Function to display messages in the chatbox

function displayMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.innerHTML = marked.parse(message);

    // Append message to the message area
    const messageContainer = document.getElementById('response');
    messageContainer.appendChild(messageDiv);

    // Scroll to the bottom of the chat
    messageContainer.scrollTop = messageContainer.scrollHeight;
}



// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DetailedExpenses();
});