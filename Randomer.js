// Global state
let avoidNumbers = new Set();

// DOM elements
const minInput         = document.querySelector('.min_input');
const maxInput         = document.querySelector('.max_input');
const randomBtn        = document.querySelector('.random_button');
const resultDiv        = document.querySelector('#result');

const secretBtn        = document.querySelector('#secret');
const passwordPanel    = document.querySelector('#password-panel');
const passwordInput    = document.querySelector('#password-input');
const passwordSubmit   = document.querySelector('#password-submit');
const passwordError    = document.querySelector('#password-error');

const avoidPanel       = document.querySelector('#avoid-panel');
const avoidDynamicList = document.querySelector('#avoid-dynamic-list');

const customAvoidInput   = document.querySelector('#custom-avoid-input');
const customAvoidBtn     = document.querySelector('#custom-avoid-btn');
const customAvoidStatus  = document.querySelector('#custom-avoid-status');

const showAllowedBtn   = document.querySelector('#show-allowed-btn');
const allowedPanel     = document.querySelector('#allowed-numbers-panel');
const allowedListDiv   = document.querySelector('#allowed-list');
const allowedCountP    = document.querySelector('#allowed-count');
const closeAllowedBtn  = document.querySelector('#close-allowed-btn');

// Password
const correctPass = "cursedels@";

// ────────────────────────────────────────────────
// Visitor label (localStorage number + simple device hint)
// ────────────────────────────────────────────────
function getVisitorLabel() {
    const STORAGE_KEY = 'randomiser_visitor_nr';
    let nr = localStorage.getItem(STORAGE_KEY);

    if (!nr) {
        nr = '1';
        localStorage.setItem(STORAGE_KEY, nr);
    }

    // Simple fingerprint-like hint to visually distinguish devices/browsers
    const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hint = [
        isMobile ? 'mobile' : 'desktop',
        `${screen.width}×${screen.height}`,
        navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} cores` : '? cores',
        Intl.DateTimeFormat().resolvedOptions().timeZone
    ].join(' • ');

    return `Utilizator ${nr}  (${hint})`;
}

const currentVisitor = getVisitorLabel();

// ────────────────────────────────────────────────
// Avoid list rendering
// ────────────────────────────────────────────────
function renderAvoidList() {
    if (avoidNumbers.size === 0) {
        avoidDynamicList.innerHTML =
            '<div style="text-align:center; color:#777; padding:16px; font-style:italic;">' +
            'No numbers are currently avoided</div>';
        return;
    }

    avoidDynamicList.innerHTML = '';
    [...avoidNumbers].sort((a,b) => a - b).forEach(num => {
        const item = document.createElement('div');
        item.className = 'avoid-dynamic-item';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = true;
        cb.dataset.num = num;

        const label = document.createElement('label');
        label.textContent = num;

        item.appendChild(cb);
        item.appendChild(label);
        avoidDynamicList.appendChild(item);

        cb.addEventListener('change', () => {
            if (!cb.checked) {
                avoidNumbers.delete(Number(cb.dataset.num));
                renderAvoidList();
            }
        });
    });
}

// ────────────────────────────────────────────────
// Custom avoid input handling
// ────────────────────────────────────────────────
function updateCustomStatus() {
    const val = customAvoidInput.value.trim();
    if (!val) {
        customAvoidStatus.textContent = '';
        customAvoidStatus.className = 'custom-status';
        return;
    }

    const num = parseInt(val, 10);
    if (isNaN(num)) {
        customAvoidStatus.textContent = 'Enter a valid number';
        customAvoidStatus.className = 'custom-status';
        return;
    }

    if (avoidNumbers.has(num)) {
        customAvoidStatus.textContent = `${num} is currently avoided`;
        customAvoidStatus.className = 'custom-status added';
    } else {
        customAvoidStatus.textContent = `${num} is not avoided`;
        customAvoidStatus.className = 'custom-status removed';
    }
}

function handleCustomAvoid() {
    const val = customAvoidInput.value.trim();
    const num = parseInt(val, 10);

    if (isNaN(num)) {
        customAvoidStatus.textContent = 'Invalid number';
        customAvoidStatus.className = 'custom-status';
        customAvoidInput.focus();
        return;
    }

    if (avoidNumbers.has(num)) {
        avoidNumbers.delete(num);
        customAvoidStatus.textContent = `Removed ${num} from avoid list`;
        customAvoidStatus.className = 'custom-status removed';
    } else {
        avoidNumbers.add(num);
        customAvoidStatus.textContent = `Added ${num} to avoid list`;
        customAvoidStatus.className = 'custom-status added';
    }

    customAvoidInput.value = '';
    customAvoidInput.focus();
    renderAvoidList();
}

// ────────────────────────────────────────────────
// Allowed numbers panel
// ────────────────────────────────────────────────
function showAllowedNumbers() {
    const min = parseInt(minInput.value, 10);
    const max = parseInt(maxInput.value, 10);

    if (isNaN(min) || isNaN(max) || min > max) {
        allowedListDiv.innerHTML = '<p style="color:red">Please enter valid min ≤ max range first</p>';
        return;
    }

    const rangeSize = max - min + 1;
    if (rangeSize > 200_000) {
        allowedListDiv.innerHTML = '<p>Range too large to display (> 200 000 numbers)</p>';
        allowedCountP.textContent = '';
        return;
    }

    let allowed = [];
    for (let i = min; i <= max; i++) {
        if (!avoidNumbers.has(i)) allowed.push(i);
    }

    allowedListDiv.innerHTML = allowed.length === 0
        ? '<p>(no possible numbers – everything is avoided)</p>'
        : allowed.join('  ');

    allowedCountP.textContent = `${allowed.length} number${allowed.length === 1 ? '' : 's'} available`;
    allowedPanel.classList.remove('hidden');
}

// ────────────────────────────────────────────────
// Secret/password panel
// ────────────────────────────────────────────────
secretBtn.addEventListener('click', () => {
    passwordPanel.classList.add('visible');
    avoidPanel.classList.remove('visible');
    passwordInput.value = '';
    passwordError.textContent = '';
    passwordInput.focus();
});

passwordSubmit.addEventListener('click', () => {
    if (passwordInput.value.trim() === correctPass) {
        passwordPanel.classList.remove('visible');
        avoidPanel.classList.add('visible');
        renderAvoidList();
        passwordError.textContent = '';
    } else {
        passwordError.textContent = 'Incorrect password';
        passwordInput.focus();
    }
});

passwordInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') passwordSubmit.click();
});

// ────────────────────────────────────────────────
// Telegram configuration
// ────────────────────────────────────────────────
const TELEGRAM_BOT_TOKEN = "8408271801:AAFDhsSvd0WTSm_Z8fTVOZylE70WDrDYxRI";
const TELEGRAM_CHAT_ID   = "5066259266";   // ← CHANGE THIS TO YOUR REAL CHAT ID

async function sendToTelegram(text) {
    if (!text) return;
    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: text,
                parse_mode: 'Markdown'
            })
        });
    } catch {
        // silent fail
    }
}

// ────────────────────────────────────────────────
// Generate random number + send report
// ────────────────────────────────────────────────
randomBtn.addEventListener('click', () => {
    const min = parseInt(minInput.value, 10);
    const max = parseInt(maxInput.value, 10);

    if (isNaN(min) || isNaN(max) || min > max) {
        resultDiv.textContent = 'Min ≤ Max please';
        resultDiv.classList.remove('has-result');
        return;
    }

    const range = max - min + 1;
    if (range <= avoidNumbers.size) {
        resultDiv.textContent = 'No valid numbers left (too many avoided)';
        resultDiv.classList.remove('has-result');
        return;
    }

    let candidate;
    do {
        candidate = Math.floor(Math.random() * range) + min;
    } while (avoidNumbers.has(candidate));

    resultDiv.textContent = candidate;
    resultDiv.classList.add('has-result');

    // Prepare and send message to Telegram
    const message = 
        `🎲 **${candidate}**\n` +
        `min = ${minInput.value || "?"}    max = ${maxInput.value || "?"}\n` +
        `Visitor: **${currentVisitor}**\n` +
        `Time: ${new Date().toISOString().replace('T', ' ').substring(0,19)}`;

    sendToTelegram(message);
});

// ────────────────────────────────────────────────
// Other event listeners
// ────────────────────────────────────────────────
customAvoidBtn.addEventListener('click', handleCustomAvoid);
customAvoidInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') handleCustomAvoid();
});
customAvoidInput.addEventListener('input', updateCustomStatus);

showAllowedBtn?.addEventListener('click', showAllowedNumbers);
closeAllowedBtn?.addEventListener('click', () => {
    allowedPanel.classList.add('hidden');
});