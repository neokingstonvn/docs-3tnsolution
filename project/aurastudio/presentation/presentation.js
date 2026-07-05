// Full screen toggle helper
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error enabling full-screen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Keyboard navigation (Arrow keys, Space, Backspace)
document.addEventListener("DOMContentLoaded", () => {
    const deck = document.getElementById('slide-deck');
    
    if (deck) {
        window.addEventListener('keydown', (e) => {
            const slides = document.querySelectorAll('.slide');
            let currentSlideIndex = 0;
            
            // Determine current active slide by scroll position
            const scrollPos = deck.scrollTop;
            const slideHeight = window.innerHeight;
            currentSlideIndex = Math.round(scrollPos / slideHeight);

            if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (currentSlideIndex < slides.length - 1) {
                    slides[currentSlideIndex + 1].scrollIntoView({ behavior: 'smooth' });
                }
            } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
                e.preventDefault();
                if (currentSlideIndex > 0) {
                    slides[currentSlideIndex - 1].scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }
});
