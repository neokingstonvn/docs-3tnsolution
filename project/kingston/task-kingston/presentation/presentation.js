// Slide navigation and screen control scripts
document.addEventListener("DOMContentLoaded", () => {
    const deck = document.getElementById("slide-deck");
    const slides = document.querySelectorAll(".slide");
    
    // Create current slide index indicator on the bottom right
    const indicator = document.createElement("div");
    indicator.style.position = "fixed";
    indicator.style.bottom = "20px";
    indicator.style.right = "20px";
    indicator.style.background = "rgba(15, 23, 42, 0.6)";
    indicator.style.backdropFilter = "blur(8px)";
    indicator.style.border = "1px solid rgba(255, 255, 255, 0.08)";
    indicator.style.padding = "6px 12px";
    indicator.style.borderRadius = "4px";
    indicator.style.fontSize = "12px";
    indicator.style.fontFamily = "monospace";
    indicator.style.color = "#94a3b8";
    indicator.style.zIndex = "99";
    indicator.textContent = `Slide 1 / ${slides.length}`;
    document.body.appendChild(indicator);

    // Scroll listener to update slide indicator
    if (deck) {
        deck.addEventListener("scroll", () => {
            const scrollPos = deck.scrollTop;
            const slideHeight = window.innerHeight;
            const currentSlideIndex = Math.round(scrollPos / slideHeight);
            indicator.textContent = `Slide ${currentSlideIndex + 1} / ${slides.length}`;
        });
    }

    // Keyboard navigation (Arrow keys, Space, Backspace)
    window.addEventListener('keydown', (e) => {
        if (!deck) return;
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
});

// Full screen toggle helper
window.toggleFullScreen = function() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error enabling full-screen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
};
