// Global variables
let healthData = [];
let bpChart = null;
let sugarChart = null;
let waterIntake = 0;
let medicationTimes = {
    morning: null,
    noon: null,
    night: null
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    loadDailyData();
    checkDailyReset();
    // updateWeddingCountdown(); // Commented out
    // setInterval(updateWeddingCountdown, 60000); // Commented out
    
    // Set up form submission
    document.getElementById('healthForm').addEventListener('submit', handleSubmit);
    
    // Set up real-time validation
    document.getElementById('systolic').addEventListener('input', validateBP);
    document.getElementById('diastolic').addEventListener('input', validateBP);
    document.getElementById('bloodSugar').addEventListener('input', validateBloodSugar);
    
    // Initialize charts
    initCharts();
    
    // Update water display
    updateWaterDisplay();
    
    // Set up manual time input listeners
    ['morning', 'noon', 'night'].forEach(period => {
        const manualInput = document.getElementById(`${period}TimeManual`);
        if (manualInput) {
            manualInput.addEventListener('change', function() {
                if (this.value) {
                    medicationTimes[period] = this.value;
                    updateMedTimeDisplay(period);
                    document.getElementById(`med${period.charAt(0).toUpperCase() + period.slice(1)}`).checked = true;
                }
            });
        }
    });
});

// Tab navigation
function showTab(tab) {
    const entrySection = document.getElementById('entrySection');
    const historySection = document.getElementById('historySection');
    const entryTab = document.getElementById('entryTab');
    const historyTab = document.getElementById('historyTab');
    
    if (tab === 'entry') {
        entrySection.classList.remove('hidden');
        historySection.classList.add('hidden');
        entryTab.classList.add('bg-blue-600', 'text-white');
        entryTab.classList.remove('bg-gray-200', 'text-gray-700');
        historyTab.classList.add('bg-gray-200', 'text-gray-700');
        historyTab.classList.remove('bg-blue-600', 'text-white');
    } else {
        entrySection.classList.add('hidden');
        historySection.classList.remove('hidden');
        historyTab.classList.add('bg-blue-600', 'text-white');
        historyTab.classList.remove('bg-gray-200', 'text-gray-700');
        entryTab.classList.add('bg-gray-200', 'text-gray-700');
        entryTab.classList.remove('bg-blue-600', 'text-white');
        updateHistory();
        updateCharts();
    }
}

// Water intake tracking
function updateWaterIntake(change) {
    waterIntake = Math.max(0, waterIntake + change);
    updateWaterDisplay();
    saveDailyData();
}

function updateWaterDisplay() {
    document.getElementById('waterCount').textContent = waterIntake;
    document.getElementById('waterTotal').textContent = `${waterIntake * 250}ml`;
}

// Medication time tracking
function updateMedTime(period) {
    const checkbox = document.getElementById(`med${period.charAt(0).toUpperCase() + period.slice(1)}`);
    const manualInput = document.getElementById(`${period}TimeManual`);
    
    if (checkbox.checked) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        medicationTimes[period] = timeString;
        manualInput.value = timeString;
    } else {
        medicationTimes[period] = null;
        manualInput.value = '';
    }
    
    updateMedTimeDisplay(period);
    saveDailyData();
}

function updateMedTimeDisplay(period) {
    const display = document.getElementById(`${period}Time`);
    if (medicationTimes[period]) {
        const time = medicationTimes[period];
        const [hours, minutes] = time.split(':');
        const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours);
        const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
        display.textContent = `Taken at ${hour12}:${minutes} ${ampm}`;
        display.className = 'text-sm text-green-600 font-medium';
    } else {
        display.textContent = 'Not taken';
        display.className = 'text-sm text-gray-600';
    }
}

// Daily data management
function saveDailyData() {
    const dailyData = {
        date: new Date().toDateString(),
        waterIntake: waterIntake,
        medicationTimes: medicationTimes
    };
    localStorage.setItem('dailyHealthData', JSON.stringify(dailyData));
}

function loadDailyData() {
    const stored = localStorage.getItem('dailyHealthData');
    if (stored) {
        const dailyData = JSON.parse(stored);
        if (dailyData.date === new Date().toDateString()) {
            waterIntake = dailyData.waterIntake || 0;
            medicationTimes = dailyData.medicationTimes || { morning: null, noon: null, night: null };
            
            // Update UI
            updateWaterDisplay();
            ['morning', 'noon', 'night'].forEach(period => {
                if (medicationTimes[period]) {
                    document.getElementById(`med${period.charAt(0).toUpperCase() + period.slice(1)}`).checked = true;
                    document.getElementById(`${period}TimeManual`).value = medicationTimes[period];
                    updateMedTimeDisplay(period);
                }
            });
        }
    }
}

function checkDailyReset() {
    const stored = localStorage.getItem('dailyHealthData');
    if (stored) {
        const dailyData = JSON.parse(stored);
        if (dailyData.date !== new Date().toDateString()) {
            // Save yesterday's data to history before reset
            if (dailyData.waterIntake > 0 || Object.values(dailyData.medicationTimes).some(time => time !== null)) {
                saveYesterdayData(dailyData);
            }
            // Reset for new day
            waterIntake = 0;
            medicationTimes = { morning: null, noon: null, night: null };
            updateWaterDisplay();
            ['morning', 'noon', 'night'].forEach(period => {
                document.getElementById(`med${period.charAt(0).toUpperCase() + period.slice(1)}`).checked = false;
                document.getElementById(`${period}TimeManual`).value = '';
                updateMedTimeDisplay(period);
            });
            saveDailyData();
        }
    }
}

function saveYesterdayData(yesterdayData) {
    const yesterdayEntry = {
        id: Date.now() - 86400000, // Yesterday's timestamp
        timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        systolic: 0,
        diastolic: 0,
        bloodSugar: 0,
        medMorning: yesterdayData.medicationTimes.morning !== null,
        medNoon: yesterdayData.medicationTimes.noon !== null,
        medNight: yesterdayData.medicationTimes.night !== null,
        morningTime: yesterdayData.medicationTimes.morning,
        noonTime: yesterdayData.medicationTimes.noon,
        nightTime: yesterdayData.medicationTimes.night,
        waterIntake: yesterdayData.waterIntake,
        winsNotes: `Auto-saved: ${yesterdayData.waterIntake} glasses of water, medications taken: ${Object.values(yesterdayData.medicationTimes).filter(t => t !== null).length}/3`,
        photo: null
    };
    healthData.push(yesterdayEntry);
    saveData();
}

// Form validation
function validateBP() {
    const systolic = parseInt(document.getElementById('systolic').value);
    const diastolic = parseInt(document.getElementById('diastolic').value);
    const alert = document.getElementById('bpAlert');
    
    if (systolic && diastolic) {
        if (systolic > 140 || diastolic > 90) {
            alert.innerHTML = '<i class="fas fa-exclamation-triangle mr-1"></i><span class="vital-danger">High blood pressure detected! Consider consulting your doctor.</span>';
            document.getElementById('systolic').classList.add('border-red-500');
            document.getElementById('diastolic').classList.add('border-red-500');
        } else if (systolic < 90 || diastolic < 60) {
            alert.innerHTML = '<i class="fas fa-exclamation-circle mr-1"></i><span class="vital-warning">Low blood pressure detected. Monitor closely.</span>';
            document.getElementById('systolic').classList.add('border-yellow-500');
            document.getElementById('diastolic').classList.add('border-yellow-500');
        } else {
            alert.innerHTML = '<i class="fas fa-check-circle mr-1"></i><span class="vital-normal">Blood pressure is in normal range.</span>';
            document.getElementById('systolic').classList.remove('border-red-500', 'border-yellow-500');
            document.getElementById('diastolic').classList.remove('border-red-500', 'border-yellow-500');
        }
    }
}

function validateBloodSugar() {
    const sugar = parseInt(document.getElementById('bloodSugar').value);
    const alert = document.getElementById('sugarAlert');
    
    if (sugar) {
        if (sugar > 200) {
            alert.innerHTML = '<i class="fas fa-exclamation-triangle mr-1"></i><span class="vital-danger">Very high blood sugar! Seek medical attention.</span>';
            document.getElementById('bloodSugar').classList.add('border-red-500');
        } else if (sugar > 140) {
            alert.innerHTML = '<i class="fas fa-exclamation-circle mr-1"></i><span class="vital-warning">High blood sugar. Monitor and consider diet adjustments.</span>';
            document.getElementById('bloodSugar').classList.add('border-yellow-500');
        } else if (sugar < 70) {
            alert.innerHTML = '<i class="fas fa-exclamation-circle mr-1"></i><span class="vital-warning">Low blood sugar. Consider eating something sweet.</span>';
            document.getElementById('bloodSugar').classList.add('border-yellow-500');
        } else {
            alert.innerHTML = '<i class="fas fa-check-circle mr-1"></i><span class="vital-normal">Blood sugar is in normal range.</span>';
            document.getElementById('bloodSugar').classList.remove('border-red-500', 'border-yellow-500');
        }
    }
}

// Handle form submission
function handleSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        systolic: parseInt(document.getElementById('systolic').value),
        diastolic: parseInt(document.getElementById('diastolic').value),
        bloodSugar: parseInt(document.getElementById('bloodSugar').value),
        medMorning: document.getElementById('medMorning').checked,
        medNoon: document.getElementById('medNoon').checked,
        medNight: document.getElementById('medNight').checked,
        morningTime: medicationTimes.morning,
        noonTime: medicationTimes.noon,
        nightTime: medicationTimes.night,
        waterIntake: waterIntake,
        winsNotes: document.getElementById('winsNotes').value,
        photo: null // Will handle photo upload separately
    };
    
    // Handle photo upload
    const photoFile = document.getElementById('photoUpload').files[0];
    if (photoFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            formData.photo = e.target.result;
            saveEntry(formData);
        };
        reader.readAsDataURL(photoFile);
    } else {
        saveEntry(formData);
    }
}

function saveEntry(data) {
    healthData.push(data);
    saveData();
    showSuccess('Entry saved successfully!');
    document.getElementById('healthForm').reset();
    
    // Clear validation alerts
    document.getElementById('bpAlert').innerHTML = '';
    document.getElementById('sugarAlert').innerHTML = '';
    document.getElementById('systolic').classList.remove('border-red-500', 'border-yellow-500');
    document.getElementById('diastolic').classList.remove('border-red-500', 'border-yellow-500');
    document.getElementById('bloodSugar').classList.remove('border-red-500', 'border-yellow-500');
}

// Data storage functions
function saveData() {
    localStorage.setItem('healthData', JSON.stringify(healthData));
}

function loadData() {
    const stored = localStorage.getItem('healthData');
    if (stored) {
        healthData = JSON.parse(stored);
    }
}

// Update history display
function updateHistory() {
    const container = document.getElementById('recentEntries');
    
    if (healthData.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No entries yet. Start tracking your health!</p>';
        return;
    }
    
    // Sort by timestamp (newest first)
    const sortedData = [...healthData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Show last 10 entries
    const recentEntries = sortedData.slice(0, 10);
    
    container.innerHTML = recentEntries.map(entry => {
        const date = new Date(entry.timestamp);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const bpClass = (entry.systolic > 140 || entry.diastolic > 90) ? 'vital-danger' : 
                       (entry.systolic < 90 || entry.diastolic < 60) ? 'vital-warning' : 'vital-normal';
        
        const sugarClass = entry.bloodSugar > 200 ? 'vital-danger' : 
                          entry.bloodSugar > 140 || entry.bloodSugar < 70 ? 'vital-warning' : 'vital-normal';
        
        const medsTaken = [entry.medMorning, entry.medNoon, entry.medNight].filter(Boolean).length;
        const waterIntake = entry.waterIntake || 0;
        
        return `
            <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-sm text-gray-600">${dateStr}</span>
                    <button onclick="deleteEntry(${entry.id})" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span class="font-medium">BP:</span>
                        <span class="${bpClass} font-bold ml-1">${entry.systolic || '-'}/${entry.diastolic || '-'}</span>
                    </div>
                    <div>
                        <span class="font-medium">Sugar:</span>
                        <span class="${sugarClass} font-bold ml-1">${entry.bloodSugar || '-'} mg/dL</span>
                    </div>
                    <div>
                        <span class="font-medium">Meds:</span>
                        <span class="ml-1">${medsTaken}/3 doses</span>
                    </div>
                    <div>
                        <span class="font-medium">Water:</span>
                        <span class="ml-1 text-blue-600">${waterIntake} glasses</span>
                    </div>
                </div>
                ${entry.morningTime || entry.noonTime || entry.nightTime ? `
                <div class="mt-2 text-xs text-gray-600">
                    <span class="font-medium">Med Times:</span>
                    ${entry.morningTime ? ` Morning: ${entry.morningTime}` : ''}
                    ${entry.noonTime ? ` Noon: ${entry.noonTime}` : ''}
                    ${entry.nightTime ? ` Night: ${entry.nightTime}` : ''}
                </div>` : ''}
                ${entry.photo ? '<div class="mt-2"><span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">📷 Photo attached</span></div>' : ''}
            </div>
        `;
    }).join('');
}

// Delete entry
function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        healthData = healthData.filter(entry => entry.id !== id);
        saveData();
        updateHistory();
        updateCharts();
        showSuccess('Entry deleted successfully!');
    }
}

// Initialize charts
function initCharts() {
    const bpCtx = document.getElementById('bpChart').getContext('2d');
    const sugarCtx = document.getElementById('sugarChart').getContext('2d');
    
    bpChart = new Chart(bpCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Systolic',
                data: [],
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.1
            }, {
                label: 'Diastolic',
                data: [],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 60,
                    max: 180
                }
            }
        }
    });
    
    sugarChart = new Chart(sugarCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Blood Sugar',
                data: [],
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 50,
                    max: 250
                }
            }
        }
    });
}

// Update charts with data
function updateCharts() {
    if (!bpChart || !sugarChart) return;
    
    // Sort data by timestamp
    const sortedData = [...healthData].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Get last 30 entries for chart
    const chartData = sortedData.slice(-30);
    
    const labels = chartData.map(entry => {
        const date = new Date(entry.timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    });
    
    const systolicData = chartData.map(entry => entry.systolic);
    const diastolicData = chartData.map(entry => entry.diastolic);
    const sugarData = chartData.map(entry => entry.bloodSugar);
    
    // Update BP chart
    bpChart.data.labels = labels;
    bpChart.data.datasets[0].data = systolicData;
    bpChart.data.datasets[1].data = diastolicData;
    bpChart.update();
    
    // Update Sugar chart
    sugarChart.data.labels = labels;
    sugarChart.data.datasets[0].data = sugarData;
    sugarChart.update();
}

// Export to CSV - All Entries
function exportToCSV() {
    if (healthData.length === 0) {
        alert('No data to export!');
        return;
    }
    
    const headers = ['Date', 'Time', 'Systolic', 'Diastolic', 'Blood Sugar', 'Morning Meds', 'Morning Time', 'Noon Meds', 'Noon Time', 'Night Meds', 'Night Time', 'Water Intake (glasses)', 'Water Intake (ml)', 'Wins/Notes'];
    const rows = healthData.map(entry => {
        const date = new Date(entry.timestamp);
        return [
            date.toLocaleDateString(),
            date.toLocaleTimeString(),
            entry.systolic || '',
            entry.diastolic || '',
            entry.bloodSugar || '',
            entry.medMorning ? 'Yes' : 'No',
            entry.morningTime || '',
            entry.medNoon ? 'Yes' : 'No',
            entry.noonTime || '',
            entry.medNight ? 'Yes' : 'No',
            entry.nightTime || '',
            entry.waterIntake || 0,
            (entry.waterIntake || 0) * 250,
            `"${(entry.winsNotes || '').replace(/"/g, '""')}"`
        ];
    });
    
    const csvContent = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health_data_all_entries_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showSuccess('All entries CSV downloaded successfully!');
}

// Export Doctor Report - Daily Summary
function exportDoctorReport() {
    if (healthData.length === 0) {
        alert('No data to export!');
        return;
    }
    
    // Aggregate data by day
    const dailyData = aggregateDataByDay();
    
    const headers = [
        'Date', 
        'Avg Systolic', 
        'Avg Diastolic', 
        'Avg Blood Sugar', 
        'Morning Meds Taken', 
        'Morning Time', 
        'Noon Meds Taken', 
        'Noon Time', 
        'Night Meds Taken', 
        'Night Time', 
        'Total Water (glasses)', 
        'Total Water (ml)', 
        'Medication Adherence (%)',
        'Daily Notes',
        'BP Readings Count',
        'Sugar Readings Count'
    ];
    
    const rows = Object.entries(dailyData).map(([date, data]) => {
        const medAdherence = ((data.morningTaken + data.noonTaken + data.nightTaken) / 3 * 100).toFixed(1);
        
        return [
            date,
            data.avgSystolic > 0 ? data.avgSystolic.toFixed(1) : 'N/A',
            data.avgDiastolic > 0 ? data.avgDiastolic.toFixed(1) : 'N/A',
            data.avgBloodSugar > 0 ? data.avgBloodSugar.toFixed(1) : 'N/A',
            data.morningTaken ? 'Yes' : 'No',
            data.morningTime || '',
            data.noonTaken ? 'Yes' : 'No',
            data.noonTime || '',
            data.nightTaken ? 'Yes' : 'No',
            data.nightTime || '',
            data.totalWater,
            data.totalWater * 250,
            `${medAdherence}%`,
            `"${(data.notes || '').replace(/"/g, '""')}"`,
            data.bpReadings,
            data.sugarReadings
        ];
    });
    
    const csvContent = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doctor_report_daily_summary_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showSuccess('Doctor Report (Daily Summary) downloaded successfully!');
}

// Aggregate health data by day
function aggregateDataByDay() {
    const dailyAggregated = {};
    
    healthData.forEach(entry => {
        const date = new Date(entry.timestamp).toLocaleDateString();
        
        if (!dailyAggregated[date]) {
            dailyAggregated[date] = {
                systolicSum: 0,
                diastolicSum: 0,
                bloodSugarSum: 0,
                bpReadings: 0,
                sugarReadings: 0,
                totalWater: 0,
                morningTaken: false,
                noonTaken: false,
                nightTaken: false,
                morningTime: null,
                noonTime: null,
                nightTime: null,
                notes: []
            };
        }
        
        const dayData = dailyAggregated[date];
        
        // Aggregate vitals (only count non-zero values)
        if (entry.systolic && entry.systolic > 0) {
            dayData.systolicSum += entry.systolic;
            dayData.diastolicSum += entry.diastolic;
            dayData.bpReadings++;
        }
        
        if (entry.bloodSugar && entry.bloodSugar > 0) {
            dayData.bloodSugarSum += entry.bloodSugar;
            dayData.sugarReadings++;
        }
        
        // Aggregate water intake
        if (entry.waterIntake && entry.waterIntake > 0) {
            dayData.totalWater += entry.waterIntake;
        }
        
        // Aggregate medication data
        if (entry.medMorning) {
            dayData.morningTaken = true;
            if (entry.morningTime) dayData.morningTime = entry.morningTime;
        }
        if (entry.medNoon) {
            dayData.noonTaken = true;
            if (entry.noonTime) dayData.noonTime = entry.noonTime;
        }
        if (entry.medNight) {
            dayData.nightTaken = true;
            if (entry.nightTime) dayData.nightTime = entry.nightTime;
        }
        
        // Collect notes
        if (entry.winsNotes && entry.winsNotes.trim()) {
            dayData.notes.push(entry.winsNotes);
        }
    });
    
    // Calculate averages and format final data
    Object.keys(dailyAggregated).forEach(date => {
        const dayData = dailyAggregated[date];
        
        dayData.avgSystolic = dayData.bpReadings > 0 ? dayData.systolicSum / dayData.bpReadings : 0;
        dayData.avgDiastolic = dayData.bpReadings > 0 ? dayData.diastolicSum / dayData.bpReadings : 0;
        dayData.avgBloodSugar = dayData.sugarReadings > 0 ? dayData.bloodSugarSum / dayData.sugarReadings : 0;
        dayData.notes = dayData.notes.join('; ');
    });
    
    return dailyAggregated;
}

// Emergency call
function callEmergency() {
    if (confirm('Call KIMS Hospital Emergency?')) {
        // KIMS Hospital emergency number (you may need to update this)
        window.location.href = 'tel:+919876543210'; // Replace with actual KIMS emergency number
    }
}

// Show success message
function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    successText.textContent = message;
    successDiv.classList.remove('hidden');
    
    setTimeout(() => {
        successDiv.classList.add('hidden');
    }, 3000);
}
