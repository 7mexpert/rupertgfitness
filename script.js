// Exercise data
const EXERCISES = [
    { id: 'push-ups', name: 'Push Ups', icon: '💪' },
    { id: 'pull-ups', name: 'Pull Ups', icon: '🧗' },
    { id: 'sit-ups', name: 'Sit Ups', icon: '🦗' },
    { id: 'squats', name: 'Squats', icon: '🦵' },
    { id: 'plank', name: 'Plank', icon: '🫐' },
    { id: 'lunges', name: 'Lunges', icon: '🏃' },
    { id: 'burpees', name: 'Burpees', icon: '🤸' },
    { id: 'jumping-jacks', name: 'Jumping Jacks', icon: '🤸‍♂️' }
];

// DOM Elements
const app = document.getElementById('app');
const onboardingScreen = document.getElementById('onboarding-screen');
const mainScreen = document.getElementById('main-screen');

// Onboarding Elements
const exerciseGrid = document.getElementById('exercise-grid');
const goalsContainer = document.getElementById('goals-container');
const userNameInput = document.getElementById('user-name');

const continueToStep2Btn = document.getElementById('continue-to-step-2');
const backToStep1Btn = document.getElementById('back-to-step-1');
const continueToStep3Btn = document.getElementById('continue-to-step-3');
const backToStep2Btn = document.getElementById('back-to-step-2');
const startFitnessJourneyBtn = document.getElementById('start-fitness-journey');

// Main App Elements
const welcomeName = document.getElementById('welcome-name');
const todayDate = document.getElementById('today-date');
const exercisesList = document.getElementById('exercises-list');
const completedCount = document.getElementById('completed-count');
const totalCount = document.getElementById('total-count');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const streakCount = document.getElementById('streak-count');
const resetOnboardingBtn = document.getElementById('reset-onboarding');

// State
let selectedExercises = [];
let userGoals = {};
let userData = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeOnboarding();
    setupEventListeners();
    
    // Check if user has already completed onboarding
    const savedData = localStorage.getItem('ruperG_fitness_data');
    if (savedData) {
        userData = JSON.parse(savedData);
        checkDailyReset();
        showMainApp();
    } else {
        showOnboarding();
    }
});

// Onboarding Functions
function initializeOnboarding() {
    renderExerciseGrid();
    updateStepButtons();
}

function renderExerciseGrid() {
    exerciseGrid.innerHTML = '';
    EXERCISES.forEach(exercise => {
        const card = document.createElement('div');
        card.className = `exercise-card ${selectedExercises.includes(exercise.id) ? 'selected' : ''}`;
        card.dataset.exerciseId = exercise.id;
        
        card.innerHTML = `
            <div class="exercise-icon">${exercise.icon}</div>
            <div class="exercise-name">${exercise.name}</div>
        `;
        
        card.addEventListener('click', () => toggleExerciseSelection(exercise.id));
        exerciseGrid.appendChild(card);
    });
}

function toggleExerciseSelection(exerciseId) {
    const index = selectedExercises.indexOf(exerciseId);
    if (index > -1) {
        selectedExercises.splice(index, 1);
    } else {
        selectedExercises.push(exerciseId);
    }
    
    renderExerciseGrid();
    updateStepButtons();
}

function updateStepButtons() {
    continueToStep2Btn.disabled = selectedExercises.length === 0;
    continueToStep3Btn.disabled = Object.keys(userGoals).length === 0;
    startFitnessJourneyBtn.disabled = !userNameInput.value.trim();
}

function renderGoalsContainer() {
    goalsContainer.innerHTML = '';
    
    selectedExercises.forEach(exerciseId => {
        const exercise = EXERCISES.find(e => e.id === exerciseId);
        const goalValue = userGoals[exerciseId] || 10;
        
        const goalItem = document.createElement('div');
        goalItem.className = 'goal-item';
        
        goalItem.innerHTML = `
            <div class="exercise-info">
                <div class="exercise-title">${exercise.name}</div>
                <div class="exercise-subtitle">Set your daily goal</div>
            </div>
            <div class="goal-input">
                <button type="button" class="btn-secondary" onclick="adjustGoal('${exerciseId}', -1)">-</button>
                <input type="number" id="goal-${exerciseId}" value="${goalValue}" min="1" max="999" oninput="updateGoal('${exerciseId}', this.value)">
                <button type="button" class="btn-secondary" onclick="adjustGoal('${exerciseId}', 1)">+</button>
            </div>
        `;
        
        goalsContainer.appendChild(goalItem);
    });
}

function adjustGoal(exerciseId, amount) {
    const input = document.getElementById(`goal-${exerciseId}`);
    let value = parseInt(input.value) || 1;
    value = Math.max(1, Math.min(999, value + amount));
    input.value = value;
    updateGoal(exerciseId, value);
}

function updateGoal(exerciseId, value) {
    const numValue = parseInt(value) || 1;
    userGoals[exerciseId] = Math.max(1, Math.min(999, numValue));
    updateStepButtons();
}

// Main App Functions
function showOnboarding() {
    onboardingScreen.classList.add('active');
    onboardingScreen.classList.remove('hidden');
    mainScreen.classList.remove('active');
    mainScreen.classList.add('hidden');
}

function showMainApp() {
    onboardingScreen.classList.remove('active');
    onboardingScreen.classList.add('hidden');
    mainScreen.classList.add('active');
    mainScreen.classList.remove('hidden');
    
    renderMainApp();
}

function renderMainApp() {
    if (!userData) return;
    
    welcomeName.textContent = `Hello, ${userData.name}!`;
    todayDate.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    renderExercisesList();
    updateProgress();
    updateStreak();
    renderCalendar();
}

function renderExercisesList() {
    exercisesList.innerHTML = '';
    
    userData.exercises.forEach(exercise => {
        const exerciseData = EXERCISES.find(e => e.id === exercise.id);
        const isCompleted = exercise.count >= exercise.goal;
        
        const exerciseItem = document.createElement('div');
        exerciseItem.className = `exercise-item ${isCompleted ? 'completed' : ''}`;
        
        exerciseItem.innerHTML = `
            <div class="exercise-details">
                <div class="exercise-name">${exerciseData.name} ${exerciseData.icon}</div>
                <div class="exercise-goal">Goal: ${exercise.goal} reps</div>
            </div>
            <div class="exercise-actions">
                <div class="count-display">${exercise.count}</div>
                <button class="btn-action small" onclick="incrementExercise('${exercise.id}', 10)" ${isCompleted ? 'disabled' : ''}>
                    +10
                </button>
                <button class="btn-action" onclick="incrementExercise('${exercise.id}', 1)" ${isCompleted ? 'disabled' : ''}>
                    +1
                </button>
            </div>
        `;
        
        exercisesList.appendChild(exerciseItem);
    });
}

function incrementExercise(exerciseId, amount = 1) {
    const exercise = userData.exercises.find(e => e.id === exerciseId);
    if (exercise && exercise.count < exercise.goal) {
        // Calculate new count, ensuring we don't exceed the goal
        const newCount = Math.min(exercise.count + amount, exercise.goal);
        exercise.count = newCount;
        
        // Add animation class
        const exerciseElement = exercisesList.querySelector(`.exercise-item:nth-child(${userData.exercises.indexOf(exercise) + 1})`);
        exerciseElement.classList.add('completing');
        
        setTimeout(() => {
            exerciseElement.classList.remove('completing');
        }, 300);
        
        saveUserData();
        renderExercisesList();
        updateProgress();
        
        // Update calendar immediately (this handles the percentage correctly)
        updateDailyHistory();
        
        // Check if all exercises are completed
        const allCompleted = userData.exercises.every(e => e.count >= e.goal);
        if (allCompleted) {
            showSuccessMessage();
        }
    } else if (exercise && exercise.count >= exercise.goal) {
        // If exercise is already completed, still update the calendar
        // This handles the case where the last exercise was just completed
        updateDailyHistory();
    }
}

function updateProgress() {
    const totalExercises = userData.exercises.length;
    const completedExercises = userData.exercises.filter(e => e.count >= e.goal).length;
    
    completedCount.textContent = completedExercises;
    totalCount.textContent = totalExercises;
    
    const percentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}%`;
}

function updateStreak() {
    streakCount.textContent = userData.streak || 0;
}

function showSuccessMessage() {
    // Create success message element
    let successMsg = document.querySelector('.success-message');
    if (!successMsg) {
        successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.textContent = '🎉 Great work! You completed today\'s workout!';
        mainScreen.insertBefore(successMsg, exercisesList);
    }
    
    successMsg.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 3000);
}

// Data Management
function saveUserData() {
    localStorage.setItem('ruperG_fitness_data', JSON.stringify(userData));
}

function checkDailyReset() {
    const today = new Date().toDateString();
    const lastDate = userData.lastDate;
    
    if (lastDate !== today) {
        // New day - reset counts
        userData.exercises.forEach(exercise => {
            exercise.count = 0;
        });
        userData.lastDate = today;
        
        // Update streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();
        
        if (userData.lastCompletedDate === yesterdayString) {
            userData.streak++;
        } else if (userData.lastCompletedDate !== today) {
            userData.streak = 1;
        }
        
        userData.lastCompletedDate = today;
        saveUserData();
    }
}

// Event Listeners
function setupEventListeners() {
    // Onboarding Navigation
    continueToStep2Btn.addEventListener('click', () => {
        renderGoalsContainer();
        showStep(2);
    });
    
    backToStep1Btn.addEventListener('click', () => showStep(1));
    continueToStep3Btn.addEventListener('click', () => showStep(3));
    backToStep2Btn.addEventListener('click', () => showStep(2));
    
    userNameInput.addEventListener('input', updateStepButtons);
    
    startFitnessJourneyBtn.addEventListener('click', completeOnboarding);
    
    // Main App
    resetOnboardingBtn.addEventListener('click', resetOnboarding);
}

function showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.onboarding-step').forEach(step => {
        step.classList.add('hidden');
    });
    
    // Show current step
    document.getElementById(`step-${stepNumber}`).classList.remove('hidden');
    
    updateStepButtons();
}

function completeOnboarding() {
    const name = userNameInput.value.trim();
    if (!name) return;
    
    userData = {
        name: name,
        exercises: selectedExercises.map(id => ({
            id: id,
            count: 0,
            goal: userGoals[id] || 10
        })),
        streak: 1,
        lastDate: new Date().toDateString(),
        lastCompletedDate: new Date().toDateString()
    };
    
    saveUserData();
    showMainApp();
}

function resetOnboarding() {
    if (confirm('Are you sure you want to reset your fitness setup? This will delete all your progress.')) {
        localStorage.removeItem('ruperG_fitness_data');
        selectedExercises = [];
        userGoals = {};
        userData = null;
        showOnboarding();
        initializeOnboarding();
    }
}

// Calendar Functions
function renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get the first day of the month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Get the last day of the month
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    
    // Add day headers
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day';
        header.style.fontWeight = '800';
        header.style.color = '#667eea';
        header.style.border = 'none';
        header.style.background = 'transparent';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        emptyDay.style.background = 'transparent';
        emptyDay.style.border = 'none';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateString = date.toDateString();
        const isToday = dateString === today.toDateString();
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        
        // Check if this day was completed
        const dayData = userData.dailyHistory ? userData.dailyHistory[dateString] : null;
        const isCompleted = dayData && dayData.completed;
        const completionPercentage = dayData ? dayData.completionPercentage || 0 : 0;
        
        const calendarDay = document.createElement('div');
        calendarDay.className = `calendar-day ${isWeekend ? 'weekend' : ''} ${isToday ? 'today' : ''} ${isCompleted ? 'completed' : ''}`;
        
        calendarDay.innerHTML = `
            <div class="day-number">${day}</div>
            <div class="progress-ring">
                <svg width="30" height="30" viewBox="0 0 30 30">
                    <circle class="bg" cx="15" cy="15" r="13"></circle>
                    <circle class="progress" cx="15" cy="15" r="13" style="stroke-dashoffset: ${100 - completionPercentage}"></circle>
                </svg>
            </div>
            <div class="completion-text">${completionPercentage}%</div>
        `;
        
        calendarGrid.appendChild(calendarDay);
    }
}

// Update daily history when exercises are completed
function updateDailyHistory() {
    if (!userData.dailyHistory) {
        userData.dailyHistory = {};
    }
    
    const today = new Date().toDateString();
    const totalExercises = userData.exercises.length;
    
    // Calculate current progress based on actual counts vs goals
    let totalGoal = 0;
    let totalCompleted = 0;
    
    userData.exercises.forEach(exercise => {
        totalGoal += exercise.goal;
        totalCompleted += exercise.count;
    });
    
    const completionPercentage = totalGoal > 0 ? Math.round((totalCompleted / totalGoal) * 100) : 0;
    const completed = userData.exercises.every(e => e.count >= e.goal);
    
    userData.dailyHistory[today] = {
        completed: completed,
        completionPercentage: completionPercentage,
        exercises: userData.exercises.map(e => ({
            id: e.id,
            count: e.count,
            goal: e.goal
        }))
    };
    
    saveUserData();
    renderCalendar();
}

// Override incrementExercise to update daily history
const originalIncrementExercise = window.incrementExercise;
window.incrementExercise = function(exerciseId, amount = 1) {
    originalIncrementExercise(exerciseId, amount);
    updateDailyHistory();
};

// Global functions for inline event handlers
window.adjustGoal = adjustGoal;
window.updateGoal = updateGoal;
window.incrementExercise = incrementExercise;
