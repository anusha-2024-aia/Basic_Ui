document.addEventListener("DOMContentLoaded", () => {
    setupTimeSlider();
    setupSOSHold();
});

// ==== SCREEN 2: REPORT ISSUE ====
function selectChip(element) {
    document.querySelectorAll('#report-chips .chip').forEach(c => c.classList.remove('selected'));
    element.classList.add('selected');
}

function submitReport() {
    const btn = document.getElementById('btn-submit-report');
    btn.innerHTML = 'Submitting...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.innerHTML = 'Submit Report';
        btn.disabled = false;
        document.getElementById('report-success').classList.remove('hidden');
        
        // Hide success after a few seconds
        setTimeout(() => {
            document.getElementById('report-success').classList.add('hidden');
        }, 4000);
    }, 800);
}

// ==== SCREEN 4: TIME SLIDER ====
function setupTimeSlider() {
    const slider = document.getElementById('timeSlider');
    if (!slider) return;

    slider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        const route = document.getElementById('map-route-line');
        const z1 = document.getElementById('zone-1');
        const z2 = document.getElementById('zone-2');
        const z3 = document.getElementById('zone-3');
        const details = document.getElementById('time-safety-details');
        
        // Reset classes
        route.className.baseVal = "route-line";
        z1.className.baseVal = "safety-zone";
        z2.className.baseVal = "safety-zone";
        z3.className.baseVal = "safety-zone";
        
        if (val === 0) { // 6 PM
            details.innerHTML = '<div class="score-row mt-3"><div class="score-badge good">86</div><div><h4>Busy & Well Lit</h4><p class="text-sm text-muted">Safe right now</p></div></div>';
        } else if (val === 1) { // 8 PM
            route.classList.add('warn');
            z1.classList.add('warn');
            z2.classList.add('warn');
            details.innerHTML = '<div class="score-row mt-3"><div class="score-badge warn">71</div><div><h4>Moderate Risk</h4><p class="text-sm text-muted">Crowd thinning out</p></div></div>';
        } else if (val === 2) { // 10 PM
            route.classList.add('danger');
            z1.classList.add('danger');
            z2.classList.add('danger');
            z3.classList.add('warn');
            details.innerHTML = '<div class="score-row mt-3"><div class="score-badge danger">48</div><div><h4>High Caution</h4><p class="text-sm text-muted">Isolated areas detected</p></div></div>';
        }
    });
}

// ==== SCREEN 5: ROUTE PLANNER ====
function selectRoute(element) {
    document.querySelectorAll('.route-card').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
}

// ==== SCREEN 6: BUDDY SIMULATION ====
function simulateBuddyMatch() {
    const searchDiv = document.getElementById('buddy-search');
    const foundDiv = document.getElementById('buddy-found');
    const btn = searchDiv.querySelector('button');
    
    btn.innerHTML = 'Searching...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.innerHTML = 'Find Buddy';
        btn.disabled = false;
        searchDiv.classList.add('hidden');
        foundDiv.classList.remove('hidden');
    }, 1500);
}

function connectBuddy() {
    const foundDiv = document.getElementById('buddy-found');
    const connectedDiv = document.getElementById('buddy-connected');
    const btn = foundDiv.querySelector('button');
    
    btn.innerHTML = 'Connecting...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.innerHTML = 'Connect Safely';
        btn.disabled = false;
        foundDiv.classList.add('hidden');
        connectedDiv.classList.remove('hidden');
        
        // Reset after some time to allow demonstration again
        setTimeout(() => {
            connectedDiv.classList.add('hidden');
            document.getElementById('buddy-search').classList.remove('hidden');
        }, 5000);
    }, 1000);
}

// ==== SCREEN 8: SOS HOLD ====
function setupSOSHold() {
    const btn = document.getElementById('btn-hold-sos');
    const progress = document.getElementById('sos-progress');
    let holdTimer;
    let holdAmount = 0;
    
    if(!btn) return;

    const startHold = (e) => {
        if(e.type === 'touchstart') e.preventDefault();
        btn.style.transform = 'scale(0.95)';
        
        holdTimer = setInterval(() => {
            holdAmount += 5; 
            const offset = 290 - (290 * holdAmount) / 100;
            progress.style.strokeDashoffset = offset;
            
            if (holdAmount >= 100) {
                clearInterval(holdTimer);
                btn.innerHTML = '<span>SOS SENT</span>';
                btn.style.background = '#22c55e';
                progress.style.stroke = '#22c55e';
            }
        }, 50);
    };
    
    const endHold = () => {
        clearInterval(holdTimer);
        btn.style.transform = 'scale(1)';
        if (holdAmount < 100) {
            holdAmount = 0;
            progress.style.strokeDashoffset = 290;
        }
    };
    
    btn.addEventListener('mousedown', startHold);
    btn.addEventListener('mouseup', endHold);
    btn.addEventListener('mouseleave', endHold);
    btn.addEventListener('touchstart', startHold);
    btn.addEventListener('touchend', endHold);
}

// Basic Toast utility
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 400);
    }, 3000);
}
