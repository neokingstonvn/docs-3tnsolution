// Initialize Mermaid
if (typeof mermaid !== 'undefined') {
    mermaid.initialize({ startOnLoad: true, theme: 'default' });
}

let zoom = 1;
let isDragging = false;
let startX, startY, translateX = 0, translateY = 0;

const viewport = document.getElementById('mermaid-viewport');
const canvas = document.getElementById('mermaid-canvas');
const zoomValue = document.getElementById('zoom-value');

function updateTransform() {
    if (canvas && zoomValue) {
        canvas.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoom})`;
        zoomValue.textContent = `${Math.round(zoom * 100)}%`;
    }
}

// Mouse pan and zoom functions
window.zoomIn = function() {
    zoom = Math.min(zoom + 0.1, 3);
    updateTransform();
};

window.zoomOut = function() {
    zoom = Math.max(zoom - 0.1, 0.5);
    updateTransform();
};

window.zoomReset = function() {
    zoom = 1;
    translateX = 0;
    translateY = 0;
    updateTransform();
};

// Mouse wheel zoom
if (viewport) {
    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            window.zoomIn();
        } else {
            window.zoomOut();
        }
    });

    // Mouse drag pan
    viewport.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
    });

    viewport.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateTransform();
    });
}

window.addEventListener('mouseup', () => {
    isDragging = false;
});

// Sidebar Navigation click
window.navTo = function(id) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        document.querySelectorAll('.nav-link').forEach(item => {
            item.classList.remove('active');
        });
        if (window.event && window.event.currentTarget) {
            window.event.currentTarget.classList.add('active');
        }
    }
};

// Progress checklist persistence
document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('.task-checkbox');
    checkboxes.forEach(cb => {
        const saved = localStorage.getItem('task_kingston_' + cb.id);
        if (saved === 'true') {
            cb.checked = true;
        }
    });
});

window.saveProgress = function() {
    const checkboxes = document.querySelectorAll('.task-checkbox');
    checkboxes.forEach(cb => {
        localStorage.setItem('task_kingston_' + cb.id, cb.checked);
    });
};

