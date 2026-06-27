// SlideEngine Instance & Global Functions
document.addEventListener('DOMContentLoaded', function() {
    autoFit();
    window.deckEngine = new SlideEngine();
});

// Auto-Fit font size scaling for long text items
function autoFit() {
    document.querySelectorAll('.slide__kpi-val').forEach(function(el) {
        if (el.scrollWidth > el.clientWidth) {
            var s = el.clientWidth / el.scrollWidth;
            el.style.transform = 'scale(' + s + ')';
            el.style.transformOrigin = 'center top';
        }
    });
}

// Full Screen mode handler
window.toggleFullScreen = function() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`Không thể kích hoạt chế độ toàn màn hình: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
};

// SlideEngine Constructor
function SlideEngine() {
    this.deck = document.querySelector('.deck');
    this.slides = [].slice.call(document.querySelectorAll('.slide'));
    this.current = 0;
    this.total = this.slides.length;
    this.buildChrome();
    this.bindEvents();
    this.observe();
    this.update();
}

// Dynamically construct presentation indicators and progress bars
SlideEngine.prototype.buildChrome = function() {
    // 1. Progress Bar
    var bar = document.createElement('div');
    bar.className = 'deck-progress';
    document.body.appendChild(bar);
    this.bar = bar;

    // 2. Navigation Dots
    var dots = document.createElement('div');
    dots.className = 'deck-dots';
    var self = this;
    this.slides.forEach(function(_, i) {
        var d = document.createElement('button');
        d.className = 'deck-dot';
        d.title = 'Slide ' + (i + 1);
        d.onclick = function() {
            self.goTo(i);
        };
        dots.appendChild(d);
    });
    document.body.appendChild(dots);
    this.dots = [].slice.call(dots.children);

    // 3. Counter indicator
    var ctr = document.createElement('div');
    ctr.className = 'deck-counter';
    document.body.appendChild(ctr);
    this.counter = ctr;

    // 4. Navigation keyboard hints
    var hints = document.createElement('div');
    hints.className = 'deck-hints';
    hints.textContent = '← → or Space to navigate';
    document.body.appendChild(hints);
    this.hints = hints;
    this.hintTimer = setTimeout(function() {
        hints.classList.add('faded');
    }, 4000);
};

// Bind keyboard, swipe, and wheel scroll events
SlideEngine.prototype.bindEvents = function() {
    var self = this;

    // Keyboard Arrow Keys / Space / PageUp / PageDown
    document.addEventListener('keydown', function(e) {
        if (e.target.closest('.slide-scroll, .table-scroll, input, textarea, [contenteditable]')) return;
        if (['ArrowDown', 'ArrowRight', ' ', 'PageDown'].indexOf(e.key) > -1) {
            e.preventDefault();
            self.next();
        } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].indexOf(e.key) > -1) {
            e.preventDefault();
            self.prev();
        } else if (e.key === 'Home') {
            e.preventDefault();
            self.goTo(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            self.goTo(self.total - 1);
        }
        self.fadeHints();
    });

    // Touch events for mobile swiping
    var touchStartY;
    this.deck.addEventListener('touchstart', function(e) {
        // Prevent interfering with vertical scrollable lists
        if (e.target.closest('.slide-scroll')) return;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    this.deck.addEventListener('touchend', function(e) {
        if (e.target.closest('.slide-scroll')) return;
        var touchEndY = e.changedTouches[0].clientY;
        var diffY = touchStartY - touchEndY;
        if (Math.abs(diffY) > 50) {
            if (diffY > 0) {
                self.next();
            } else {
                self.prev();
            }
        }
    }, { passive: true });
};

// Observe viewport entry using IntersectionObserver
SlideEngine.prototype.observe = function() {
    var self = this;
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                self.current = self.slides.indexOf(entry.target);
                self.update();
            }
        });
    }, { threshold: 0.5 });

    this.slides.forEach(function(slide) {
        observer.observe(slide);
    });
};

// Navigate to specific slide index
SlideEngine.prototype.goTo = function(i) {
    var targetIndex = Math.max(0, Math.min(i, this.total - 1));
    this.slides[targetIndex].scrollIntoView({ behavior: 'smooth' });
};

SlideEngine.prototype.next = function() {
    if (this.current < this.total - 1) {
        this.goTo(this.current + 1);
    }
};

SlideEngine.prototype.prev = function() {
    if (this.current > 0) {
        this.goTo(this.current - 1);
    }
};

// Update Chrome widgets
SlideEngine.prototype.update = function() {
    var activeIdx = this.current;
    
    // Progress bar width
    if (this.bar) {
        this.bar.style.width = ((activeIdx + 1) / this.total * 100) + '%';
    }

    // Dots active state
    if (this.dots) {
        this.dots.forEach(function(dot, idx) {
            dot.classList.toggle('active', idx === activeIdx);
        });
    }

    // Counter text
    if (this.counter) {
        this.counter.textContent = (activeIdx + 1) + ' / ' + this.total;
    }
};

// Dismiss hint label
SlideEngine.prototype.fadeHints = function() {
    clearTimeout(this.hintTimer);
    if (this.hints) {
        this.hints.classList.add('faded');
    }
};
