// DOM elements
const minInput       = document.querySelector('.min_input');
const maxInput       = document.querySelector('.max_input');
const randomBtn      = document.querySelector('.random_button');
const resultDiv      = document.querySelector('#result');
const secretBtn      = document.querySelector('#secret');
const passwordPanel  = document.querySelector('#password-panel');
const passwordInput  = document.querySelector('#password-input');
const passwordSubmit = document.querySelector('#password-submit');
const passwordError  = document.querySelector('#password-error');
const avoidPanel     = document.querySelector('#avoid-panel');
const avoidList      = document.querySelector('#avoid-list');

// State
let avoidNumbers = new Set();
const CORRECT_PASSWORD = "capitanita";
let avoidPanelWasShown = false;   // track if we ever successfully unlocked

// Create checklist 1–20 (only once, when first unlocked)
function initAvoidList() {
    if (avoidList.children.length > 0) return; // already created

    avoidList.innerHTML = '';
    for (let i = 1; i <= 20; i++) {
        const div = document.createElement('div');
        div.className = 'avoid-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `avoid-${i}`;
        checkbox.value = i;

        const label = document.createElement('label');
        label.htmlFor = `avoid-${i}`;
        label.textContent = i;

        div.appendChild(checkbox);
        div.appendChild(label);
        avoidList.appendChild(div);

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                avoidNumbers.add(i);
            } else {
                avoidNumbers.delete(i);
            }
        });
    }
}

// Toggle secret button → controls which panel to show
secretBtn.addEventListener('click', () => {
    const passwordIsVisible = passwordPanel.classList.contains('visible');
    const avoidIsVisible    = avoidPanel.classList.contains('visible');

    // Case 1: nothing visible → show password panel + reset it
    if (!passwordIsVisible && !avoidIsVisible) {
        passwordPanel.classList.add('visible');
        passwordInput.value = '';           // always clear
        passwordError.textContent = '';     // clear error
        passwordInput.focus();
        secretBtn.classList.add('active');
        avoidPanel.classList.remove('visible');
        return;
    }

    // Case 2: password panel is open → close everything
    if (passwordIsVisible) {
        passwordPanel.classList.remove('visible');
        secretBtn.classList.remove('active');
        passwordInput.value = '';
        passwordError.textContent = '';
        return;
    }

    // Case 3: avoid panel is open → close it (back to normal state)
    if (avoidIsVisible) {
        avoidPanel.classList.remove('visible');
        secretBtn.classList.remove('active');
        return;
    }
});

// Submit password
passwordSubmit.addEventListener('click', () => {
    const entered = passwordInput.value.trim();

    if (entered === CORRECT_PASSWORD) {
        passwordPanel.classList.remove('visible');
        passwordError.textContent = '';
        avoidPanel.classList.add('visible');
        initAvoidList();           // create checklist if not already done
        avoidPanelWasShown = true; // remember we unlocked once
    } else {
        passwordError.textContent = 'Incorrect password';
        passwordInput.value = '';
        passwordInput.focus();
    }
});

// Enter key support
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        passwordSubmit.click();
    }
});

// Generate random number (unchanged from previous version)
randomBtn.addEventListener('click', () => {
    const minVal = parseInt(minInput.value);
    const maxVal = parseInt(maxInput.value);

    if (isNaN(minVal) || isNaN(maxVal)) {
        resultDiv.textContent = "Enter valid numbers";
        resultDiv.classList.remove('has-result', 'avoid-active');
        return;
    }

    if (minVal > maxVal) {
        resultDiv.textContent = "Min ≤ Max please";
        resultDiv.classList.remove('has-result', 'avoid-active');
        return;
    }

    let result;
    const rangeSize = maxVal - minVal + 1;
    const hasAvoids = avoidNumbers.size > 0;

    if (!hasAvoids) {
        result = Math.floor(Math.random() * rangeSize) + minVal;
    } else {
        let attempts = 0;
        const maxAttempts = 100;

        do {
            result = Math.floor(Math.random() * rangeSize) + minVal;
            attempts++;
            if (attempts > maxAttempts) {
                resultDiv.textContent = "Too many avoids – no possible number";
                resultDiv.classList.remove('has-result');
                return;
            }
        } while (avoidNumbers.has(result));
    }

    resultDiv.textContent = result;
    resultDiv.classList.add('has-result');
    resultDiv.classList.toggle('avoid-active', hasAvoids);
});