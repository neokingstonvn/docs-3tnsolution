let zoom = 1;
let isDragging = false;
let startX, startY, translateX = 0, translateY = 0;

document.addEventListener("DOMContentLoaded", () => {
    const viewport = document.getElementById('mermaid-viewport');
    const canvas = document.getElementById('mermaid-canvas');
    const zoomValue = document.getElementById('zoom-value');

    if (viewport && canvas && zoomValue) {
        function updateTransform() {
            canvas.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoom})`;
            zoomValue.textContent = `${Math.round(zoom * 100)}%`;
        }

        window.zoomIn = function() {
            zoom = Math.min(zoom + 0.1, 3);
            updateTransform();
        }

        window.zoomOut = function() {
            zoom = Math.max(zoom - 0.1, 0.5);
            updateTransform();
        }

        window.zoomReset = function() {
            zoom = 1;
            translateX = 0;
            translateY = 0;
            updateTransform();
        }

        // Mouse wheel zoom
        viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                zoomIn();
            } else {
                zoomOut();
            }
        });

        // Mouse drag pan
        viewport.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            viewport.style.cursor = 'grabbing';
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            if (viewport) {
                viewport.style.cursor = 'grab';
            }
        });

        viewport.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform();
        });
    }
});

// Sidebar Navigation click
window.navTo = function(id) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        document.querySelectorAll('.nav-link').forEach(item => {
            item.classList.remove('active');
        });
        if (event && event.currentTarget) {
            event.currentTarget.classList.add('active');
        }
    }
}
