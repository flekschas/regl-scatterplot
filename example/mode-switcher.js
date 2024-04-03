//code I added

// Assuming these imports are necessary to interact with your existing codebase
// Adjust these imports according to your actual file paths and names
import createDir from '../src/dir-manager/index.js';
import createLasso from '../src/lasso-manager/index.js';

let currentMode = 'dir'; // Default to 'dir' mode

function switchMode() {
    currentMode = (currentMode === 'dir') ? 'lasso' : 'dir';
    updateButtonLabel();
    applyCurrentMode();
}

function updateButtonLabel() {
    const button = document.getElementById('mode-switch-button');
    button.textContent = `Switch to ${currentMode === 'dir' ? 'Lasso' : 'Dir'}`;
}

function applyCurrentMode() {
    // Apply the current mode to your scatterplot or other components
    // This might involve re-initializing components or updating settings
}

function createModeSwitchButton() {
    const button = document.createElement('button');
    button.id = 'mode-switch-button';
    button.textContent = 'Switch to Lasso';
    button.addEventListener('click', switchMode);
    document.body.appendChild(button); // Or append it to a specific menu or container
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    createModeSwitchButton();
    applyCurrentMode();
});

export { currentMode, switchMode };

  
  //end of code I added
  