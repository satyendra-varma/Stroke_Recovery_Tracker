// Global variables
let healthData = [];
let bpChart = null;
let sugarChart = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateWeddingCountdown();
    setInterval(updateWeddingCountdown, 60000); // Update every minute
    
    // Set up form submission
    document.getElementById('healthForm').addEventListener('submit', handleSubmit);
    
    // Set up real-time validation
    document.getElementById('systolic').addEventListener('input', validateBP);
    document.getElementById('diastolic').addEventListener('input', validateBP);
    document.getElementById('bloodSugar').addEventListener('input', validateBloodSugar);
    
    // Initialize charts
    initCharts();
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

// Wedding countdown
function updateWeddingCountdown() {
    const weddingDate = new Date('2026-03-14T00:00:00');
    const now = new Date();
    const diff = weddingDate - now;
    
    if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        document.getElementById('weddingCountdown').innerHTML = 
            `${days}d ${hours}h ${minutes}m`;
    } else {
        document.getElementById('weddingCountdown').innerHTML = '🎉 Wedding Day! 🎉';
    }
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
                        <span class="${bpClass} font-bold ml-1">${entry.systolic}/${entry.diastolic}</span>
                    </div>
                    <div>
                        <span class="font-medium">Sugar:</span>
                        <span class="${sugarClass} font-bold ml-1">${entry.bloodSugar} mg/dL</span>
                    </div>
                    <div>
                        <span class="font-medium">Meds:</span>
                        <span class="ml-1">${medsTaken}/3 doses</span>
                    </div>
                    <div>
                        <span class="font-medium">Notes:</span>
                        <span class="ml-1 text-gray-600 truncate">${entry.winsNotes.substring(0, 30)}...</span>
                    </div>
                </div>
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

// Export to CSV
function exportToCSV() {
    if (healthData.length === 0) {
        alert('No data to export!');
        return;
    }
    
    const headers = ['Date', 'Time', 'Systolic', 'Diastolic', 'Blood Sugar', 'Morning Meds', 'Noon Meds', 'Night Meds', 'Wins/Notes'];
    const rows = healthData.map(entry => {
        const date = new Date(entry.timestamp);
        return [
            date.toLocaleDateString(),
            date.toLocaleTimeString(),
            entry.systolic,
            entry.diastolic,
            entry.bloodSugar,
            entry.medMorning ? 'Yes' : 'No',
            entry.medNoon ? 'Yes' : 'No',
            entry.medNight ? 'Yes' : 'No',
            `"${entry.winsNotes.replace(/"/g, '""')}"`
        ];
    });
    
    const csvContent = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showSuccess('CSV file downloaded successfully!');
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
