let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let weeklyIncomeUSD = parseFloat(localStorage.getItem('weeklyIncomeUSD')) || 225; // Default $225 USD per week
let exchangeRate = parseFloat(localStorage.getItem('exchangeRate')) || 1000; // Default exchange rate
let weeklyIncomeARS = weeklyIncomeUSD * exchangeRate; // Calculate ARS income
let categoryChart = null;
let trendChart = null;
let currentViewMonth = new Date().getMonth();
let currentViewYear = new Date().getFullYear();

// Format currency functions
function formatARS(amount) {
    return amount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatUSD(amount) {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const categoryColors = {
    food: '#EF4444',
    transport: '#3B82F6', 
    utilities: '#F59E0B',
    entertainment: '#8B5CF6',
    shopping: '#EC4899',
    health: '#10B981',
    education: '#6366F1',
    savings: '#14B8A6',
    other: '#6B7280'
};

const categoryIcons = {
    food: '🍔',
    transport: '🚗',
    utilities: '💡',
    entertainment: '🎮',
    shopping: '🛒',
    health: '🏥',
    education: '📚',
    savings: '💰',
    other: '📌'
};

// Modal Functions with animations
function openIncomeModal() {
    const modal = document.getElementById('incomeModal');
    const modalContent = modal.querySelector('.modal-content');
    
    document.getElementById('modalWeeklyIncomeUSD').value = weeklyIncomeUSD;
    document.getElementById('exchangeRate').value = exchangeRate;
    modal.classList.remove('hidden');
    
    // Trigger reflow to ensure animation plays
    modal.offsetHeight;
    
    modal.classList.remove('closing');
    modalContent.classList.remove('closing');
    
    // Focus on input after animation
    setTimeout(() => {
        document.getElementById('modalWeeklyIncomeUSD').focus();
        document.getElementById('modalWeeklyIncomeUSD').select();
    }, 300);
    
    // Update conversion display
    updateConversion();
}

function closeIncomeModal() {
    const modal = document.getElementById('incomeModal');
    const modalContent = modal.querySelector('.modal-content');
    
    modal.classList.add('closing');
    modalContent.classList.add('closing');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('closing');
        modalContent.classList.remove('closing');
    }, 200);
}

function saveIncome() {
    const newIncomeUSD = parseFloat(document.getElementById('modalWeeklyIncomeUSD').value);
    const newExchangeRate = parseFloat(document.getElementById('exchangeRate').value);
    
    if (newIncomeUSD && newIncomeUSD > 0 && newExchangeRate && newExchangeRate > 0) {
        weeklyIncomeUSD = newIncomeUSD;
        exchangeRate = newExchangeRate;
        weeklyIncomeARS = weeklyIncomeUSD * exchangeRate;
        
        localStorage.setItem('weeklyIncomeUSD', weeklyIncomeUSD);
        localStorage.setItem('exchangeRate', exchangeRate);
        
        updateUI();
        closeIncomeModal();
        showNotification(`Ingreso actualizado: USD ${formatUSD(weeklyIncomeUSD)} = ARS ${formatARS(weeklyIncomeARS)}`, 'success');
    } else {
        // Shake effect for invalid input
        const inputUSD = document.getElementById('modalWeeklyIncomeUSD');
        const inputRate = document.getElementById('exchangeRate');
        
        if (!newIncomeUSD || newIncomeUSD <= 0) {
            inputUSD.classList.add('animate-shake');
            setTimeout(() => inputUSD.classList.remove('animate-shake'), 500);
        }
        if (!newExchangeRate || newExchangeRate <= 0) {
            inputRate.classList.add('animate-shake');
            setTimeout(() => inputRate.classList.remove('animate-shake'), 500);
        }
    }
}

function openExpenseModal() {
    const modal = document.getElementById('expenseModal');
    const modalContent = modal.querySelector('.modal-content');
    
    document.getElementById('modalDate').valueAsDate = new Date();
    modal.classList.remove('hidden');
    
    // Reset category selection
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('bg-blue-100', 'border-blue-500', 'text-blue-700');
        btn.classList.add('border-gray-300');
    });
    document.getElementById('modalCategory').value = '';
    
    // Trigger reflow to ensure animation plays
    modal.offsetHeight;
    
    modal.classList.remove('closing');
    modalContent.classList.remove('closing');
    
    // Focus on first input after animation
    setTimeout(() => {
        document.getElementById('modalDescription').focus();
    }, 300);
}

function closeExpenseModal() {
    const modal = document.getElementById('expenseModal');
    const modalContent = modal.querySelector('.modal-content');
    
    modal.classList.add('closing');
    modalContent.classList.add('closing');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('closing');
        modalContent.classList.remove('closing');
        document.getElementById('modalExpenseForm').reset();
    }, 200);
}

// Modal form submission
document.getElementById('modalExpenseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const expense = {
        id: Date.now(),
        description: document.getElementById('modalDescription').value,
        amount: parseFloat(document.getElementById('modalAmount').value),
        category: document.getElementById('modalCategory').value,
        date: document.getElementById('modalDate').value
    };
    
    expenses.push(expense);
    saveToLocalStorage();
    updateUI();
    closeExpenseModal();
    
    showNotification('Gasto agregado exitosamente!', 'success');
});

function saveToLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Click outside modal to close with animation
window.onclick = function(event) {
    if (event.target == document.getElementById('incomeModal')) {
        closeIncomeModal();
    }
    if (event.target == document.getElementById('expenseModal')) {
        closeExpenseModal();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to close modals
    if (e.key === 'Escape') {
        if (!document.getElementById('incomeModal').classList.contains('hidden')) {
            closeIncomeModal();
        }
        if (!document.getElementById('expenseModal').classList.contains('hidden')) {
            closeExpenseModal();
        }
    }
    
    // Ctrl/Cmd + N to open expense modal
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openExpenseModal();
    }
});

function getWeeksInMonth(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Calculate weeks based on Monday as start of week
    const firstMonday = firstDay.getDay() === 1 ? 1 : (8 - firstDay.getDay() + 1) % 7 + 1;
    const weeksInMonth = Math.ceil((daysInMonth - firstMonday + 1) / 7) + (firstMonday > 1 ? 1 : 0);
    
    return Math.min(5, Math.max(4, weeksInMonth)); // Usually 4 or 5 weeks
}

function getWeekRanges(year, month) {
    const weeks = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let currentWeekStart = new Date(firstDay);
    let weekNumber = 1;
    
    while (currentWeekStart <= lastDay) {
        let weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        if (weekEnd > lastDay) {
            weekEnd = new Date(lastDay);
        }
        
        weeks.push({
            number: weekNumber,
            start: new Date(currentWeekStart),
            end: new Date(weekEnd)
        });
        
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        weekNumber++;
    }
    
    return weeks;
}

function deleteExpense(id) {
    if(confirm('Are you sure you want to delete this expense?')) {
        expenses = expenses.filter(e => e.id !== id);
        saveToLocalStorage();
        updateUI();
        showNotification('Gasto eliminado!', 'info');
    }
}

function updateUI() {
    updateSummaryCards();
    updateQuickStats();
    updateExpenseList();
    updateCharts();
}

function updateQuickStats() {
    const monthlyExpenses = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === currentViewMonth && expenseDate.getFullYear() === currentViewYear;
    });
    
    // Highest expense
    const highestExpense = monthlyExpenses.length > 0 
        ? Math.max(...monthlyExpenses.map(e => e.amount))
        : 0;
    document.getElementById('highestExpense').textContent = `ARS ${formatARS(highestExpense)}`;
    
    // Top category
    const categoryTotals = {};
    monthlyExpenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    const topCategory = Object.keys(categoryTotals).length > 0
        ? Object.keys(categoryTotals).reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b)
        : '-';
    document.getElementById('topCategory').textContent = topCategory !== '-' 
        ? `${categoryIcons[topCategory]} ${topCategory}`
        : '-';
    
    // Total expense count
    document.getElementById('totalExpenseCount').textContent = monthlyExpenses.length;
}

function updateSummaryCards() {
    const monthlyExpenses = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === currentViewMonth && expenseDate.getFullYear() === currentViewYear;
    });
    
    const weeksInMonth = getWeeksInMonth(currentViewYear, currentViewMonth);
    const monthlyBudgetARS = weeklyIncomeARS * weeksInMonth;
    const monthlyBudgetUSD = weeklyIncomeUSD * weeksInMonth;
    
    const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0); // Expenses in ARS
    const remaining = monthlyBudgetARS - totalSpent;
    const spentPercentage = monthlyBudgetARS > 0 ? ((totalSpent / monthlyBudgetARS) * 100) : 0;
    
    // Update month title
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const monthTitle = `${monthNames[currentViewMonth]} ${currentViewYear} Overview`;
    document.getElementById('currentMonthTitle').textContent = monthTitle;
    
    // Update mobile month title if it exists
    const mobileTitleElement = document.getElementById('currentMonthTitleMobile');
    if (mobileTitleElement) {
        mobileTitleElement.textContent = monthTitle;
    }
    
    // Update income display
    document.getElementById('monthlyIncome').textContent = `ARS ${formatARS(monthlyBudgetARS)}`;
    document.getElementById('monthlyIncomeUSD').textContent = `USD ${formatUSD(monthlyBudgetUSD)}`;
    document.getElementById('weeksInMonth').textContent = `${weeksInMonth} semanas`;
    
    // Calculate days in month and days left
    const daysInMonth = new Date(currentViewYear, currentViewMonth + 1, 0).getDate();
    const today = new Date();
    const currentDay = today.getDate();
    const daysLeft = today.getMonth() === currentViewMonth && today.getFullYear() === currentViewYear 
        ? daysInMonth - currentDay + 1 
        : 0;
    
    // Calculate daily average and budget
    const daysElapsed = today.getMonth() === currentViewMonth && today.getFullYear() === currentViewYear 
        ? currentDay 
        : daysInMonth;
    const dailyAverage = daysElapsed > 0 ? totalSpent / daysElapsed : 0;
    const dailyBudget = monthlyBudgetARS / daysInMonth;
    
    // Calculate projected spending
    const projectedTotal = dailyAverage * daysInMonth;
    const projectedSavings = monthlyBudgetARS - projectedTotal;
    
    // Determine budget status
    let budgetStatus = 'En curso';
    let statusColor = 'text-green-600';
    if (totalSpent > monthlyBudgetARS) {
        budgetStatus = 'Excedido';
        statusColor = 'text-red-600';
    } else if (projectedTotal > monthlyBudgetARS) {
        budgetStatus = 'En riesgo';
        statusColor = 'text-orange-600';
    }
    
    // Update all elements
    document.getElementById('totalSpent').textContent = `ARS ${formatARS(totalSpent)}`;
    document.getElementById('spentPercentage').textContent = `${spentPercentage.toFixed(1)}% del presupuesto`;
    document.getElementById('remaining').textContent = `ARS ${formatARS(Math.abs(remaining))}`;
    document.getElementById('remaining').className = remaining >= 0 
        ? 'text-2xl font-bold text-gray-200 mt-1' 
        : 'text-2xl font-bold text-red-600 mt-1';
    document.getElementById('daysLeft').textContent = daysLeft > 0 ? `${daysLeft} días restantes` : 'Mes finalizado';
    document.getElementById('dailyAverage').textContent = `ARS ${formatARS(dailyAverage)}`;
    document.getElementById('dailyBudget').textContent = `Presupuesto: ARS ${formatARS(dailyBudget)}/día`;
    document.getElementById('budgetStatus').textContent = budgetStatus;
    document.getElementById('budgetStatus').className = `text-lg font-bold mt-1 ${statusColor}`;
    document.getElementById('projectedSavings').textContent = `Proyectado: ARS ${formatARS(projectedSavings)}`;
    
    // Update progress bar
    const progressPercentage = Math.min(100, spentPercentage);
    document.getElementById('budgetProgressBar').style.width = `${progressPercentage}%`;
    document.getElementById('budgetProgressBar').className = `h-full transition-all duration-500 ${
        spentPercentage > 100 ? 'bg-gradient-to-r from-red-500 to-red-600' :
        spentPercentage > 80 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
        'bg-gradient-to-r from-blue-500 to-blue-600'
    }`;
    document.getElementById('budgetProgressText').textContent = 
        `ARS ${formatARS(totalSpent)} de ARS ${formatARS(monthlyBudgetARS)} (${spentPercentage.toFixed(1)}%)`;
    
    // Update weekly breakdown
    updateWeeklyBreakdown(monthlyExpenses);
}

function updateExpenseList(filter = '') {
    const tbody = document.getElementById('expenseList');
    const mobileList = document.getElementById('expenseListMobile');
    
    let filteredExpenses = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === currentViewMonth && expenseDate.getFullYear() === currentViewYear;
    });
    
    if (filter) {
        filteredExpenses = filteredExpenses.filter(e => 
            e.description.toLowerCase().includes(filter.toLowerCase()) ||
            e.category.toLowerCase().includes(filter.toLowerCase())
        );
    }
    
    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Desktop table view
    tbody.innerHTML = filteredExpenses.slice(0, 10).map(expense => `
        <tr class="border-b hover:bg-gray-50">
            <td class="py-2 px-2 text-sm">${formatDate(expense.date)}</td>
            <td class="py-2 px-2">${expense.description}</td>
            <td class="py-2 px-2">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" 
                    style="background-color: ${categoryColors[expense.category]}20; color: ${categoryColors[expense.category]}">
                    ${categoryIcons[expense.category]} ${expense.category}
                </span>
            </td>
            <td class="py-2 px-2 text-right font-medium">ARS ${formatARS(expense.amount)}</td>
            <td class="py-2 px-2 text-center">
                <button onclick="deleteExpense(${expense.id})" 
                    class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Mobile card view
    mobileList.innerHTML = filteredExpenses.slice(0, 10).map(expense => `
        <div class="expense-card-mobile" style="border-left-color: ${categoryColors[expense.category]}">
            <div class="flex justify-between items-start mb-1.5">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-800 text-sm">${expense.description}</h4>
                    <p class="text-xs text-gray-500 mt-0.5">${formatDate(expense.date)}</p>
                </div>
                <button onclick="deleteExpense(${expense.id})" 
                    class="text-red-500 hover:text-red-700 p-0.5 -mt-1 -mr-1">
                    <i class="fas fa-trash text-xs"></i>
                </button>
            </div>
            <div class="flex justify-between items-center">
                <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium" 
                    style="background-color: ${categoryColors[expense.category]}20; color: ${categoryColors[expense.category]}">
                    ${categoryIcons[expense.category]} ${expense.category}
                </span>
                <span class="font-semibold text-gray-800 text-sm">ARS ${formatARS(expense.amount)}</span>
            </div>
        </div>
    `).join('');
    
    if (filteredExpenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500"><i class="fas fa-inbox text-3xl mb-2"></i><br>No hay gastos registrados</td></tr>';
        mobileList.innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fas fa-inbox text-3xl mb-2"></i><br>No hay gastos registrados</div>';
    }
}

function updateCharts() {
    updateCategoryChart();
    updateTrendChart();
}

function updateCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    const monthlyExpenses = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === currentViewMonth && expenseDate.getFullYear() === currentViewYear;
    });
    
    const categoryTotals = {};
    monthlyExpenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    
    const data = {
        labels: Object.keys(categoryTotals).map(cat => 
            `${categoryIcons[cat]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`
        ),
        datasets: [{
            data: Object.values(categoryTotals),
            backgroundColor: Object.keys(categoryTotals).map(cat => categoryColors[cat]),
            borderWidth: 0
        }]
    };
    
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        font: {
                            size: 11
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Gastos Mensuales por Categoría',
                    font: {
                        size: 14
                    }
                }
            }
        }
    });
}

function updateTrendChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    const daysInMonth = new Date(currentViewYear, currentViewMonth + 1, 0).getDate();
    const monthDays = [];
    const dailyTotals = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentViewYear}-${String(currentViewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        monthDays.push(day);
        
        const dayTotal = expenses
            .filter(e => e.date === dateStr)
            .reduce((sum, e) => sum + e.amount, 0);
        dailyTotals.push(dayTotal);
    }
    
    if (trendChart) {
        trendChart.destroy();
    }
    
    trendChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthDays,
            datasets: [{
                label: 'Daily Spending',
                data: dailyTotals,
                backgroundColor: '#3B82F6',
                borderColor: '#2563EB',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Daily Spending This Month',
                    font: {
                        size: 14
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

function changeMonth(direction) {
    if (direction === 0) {
        // Current month
        currentViewMonth = new Date().getMonth();
        currentViewYear = new Date().getFullYear();
    } else if (direction === -1) {
        // Previous month
        currentViewMonth--;
        if (currentViewMonth < 0) {
            currentViewMonth = 11;
            currentViewYear--;
        }
    } else if (direction === 1) {
        // Next month
        currentViewMonth++;
        if (currentViewMonth > 11) {
            currentViewMonth = 0;
            currentViewYear++;
        }
    }
    
    updateUI();
}

function updateWeeklyBreakdown(monthlyExpenses) {
    const weekRanges = getWeekRanges(currentViewYear, currentViewMonth);
    const weeklyBreakdownDiv = document.getElementById('weeklyBreakdown');
    
    if (!weeklyBreakdownDiv) {
        console.error('Weekly breakdown element not found');
        return;
    }
    
    let weeklyHTML = '';
    
    weekRanges.forEach(week => {
        const weekExpenses = monthlyExpenses.filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate >= week.start && expenseDate <= week.end;
        });
        
        const weekTotal = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
        const weekRemaining = weeklyIncomeARS - weekTotal;
        const weekPercentage = weeklyIncomeARS > 0 ? (weekTotal / weeklyIncomeARS) * 100 : 0;
        
        const statusColor = weekRemaining >= 0 ? 'text-green-600' : 'text-red-600';
        
        weeklyHTML += `
            <div class="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <div class="text-sm font-semibold text-gray-700">Semana ${week.number}</div>
                        <div class="text-xs text-gray-500">${formatShortDate(week.start)} - ${formatShortDate(week.end)}</div>
                    </div>
                    <span class="text-xs px-2 py-1 rounded-full ${weekRemaining >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                        ${weekRemaining >= 0 ? 'OK' : 'Excedido'}
                    </span>
                </div>
                <div class="text-lg font-bold ${statusColor} mb-2">
                    ARS ${formatARS(weekTotal)} <span class="text-xs font-normal text-gray-500">/ ARS ${formatARS(weeklyIncomeARS)}</span>
                </div>
                <div class="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div class="h-full transition-all duration-300 ${weekPercentage > 100 ? 'bg-gradient-to-r from-red-400 to-red-500' : weekPercentage > 75 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-gradient-to-r from-green-400 to-green-500'}" 
                         style="width: ${Math.min(100, weekPercentage)}%"></div>
                </div>
                <div class="text-xs text-gray-500 mt-1">${weekPercentage.toFixed(0)}% usado</div>
            </div>
        `;
    });
    
    if (weeklyHTML === '') {
        weeklyHTML = '<div class="text-center text-gray-500 py-4">No hay datos de semanas para mostrar</div>';
    }
    
    weeklyBreakdownDiv.innerHTML = weeklyHTML;
}

function formatShortDate(date) {
    const month = date.toLocaleString('default', { month: 'short' });
    return `${month} ${date.getDate()}`;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const month = date.toLocaleString('default', { month: 'short' });
    return `${month} ${date.getDate()}`;
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'from-green-500 to-emerald-600' : 
                    type === 'error' ? 'from-red-500 to-pink-600' : 
                    'from-blue-500 to-indigo-600';
    
    notification.className = `fixed top-20 right-4 px-6 py-4 rounded-xl shadow-2xl text-white z-50 bg-gradient-to-r ${bgColor} transform translate-x-full transition-transform duration-300`;
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${
                type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-exclamation-circle' : 
                'fa-info-circle'
            } text-xl"></i>
            <span class="font-medium">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
        notification.classList.add('translate-x-0');
    }, 10);
    
    // Slide out and remove
    setTimeout(() => {
        notification.classList.remove('translate-x-0');
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

document.getElementById('searchExpense').addEventListener('input', function(e) {
    updateExpenseList(e.target.value);
});

function exportData() {
    const data = {
        expenses: expenses,
        weeklyIncomeUSD: weeklyIncomeUSD,
        exchangeRate: exchangeRate,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Datos exportados exitosamente!', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('This will replace all current data. Are you sure?')) {
                expenses = data.expenses || [];
                
                // Handle old format compatibility
                if (data.weeklyIncomeUSD) {
                    weeklyIncomeUSD = data.weeklyIncomeUSD;
                    exchangeRate = data.exchangeRate || 1000;
                } else if (data.weeklyIncome) {
                    // Old format - convert assuming it was in USD
                    weeklyIncomeUSD = data.weeklyIncome / 4; // Rough conversion
                    exchangeRate = 1000;
                } else {
                    weeklyIncomeUSD = 225;
                    exchangeRate = 1000;
                }
                
                weeklyIncomeARS = weeklyIncomeUSD * exchangeRate;
                
                saveToLocalStorage();
                localStorage.setItem('weeklyIncomeUSD', weeklyIncomeUSD);
                localStorage.setItem('exchangeRate', exchangeRate);
                updateUI();
                
                showNotification('Datos importados exitosamente!', 'success');
            }
        } catch (error) {
            showNotification('Error al importar archivo. Por favor verifica el formato.', 'error');
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

updateUI();