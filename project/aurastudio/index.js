// Smooth scrolling to section
function scrollToSec(id) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        
        // Update active sidebar nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const currentTarget = event ? event.currentTarget : null;
        if (currentTarget) {
            currentTarget.classList.add('active');
        }
    }
}

// Active state reflection on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-item');
    
    let currentId = '';
    sections.forEach(sec => {
        const secTop = sec.offsetTop;
        if (window.scrollY >= secTop - 120) {
            currentId = sec.getAttribute('id');
        }
    });

    if (currentId) {
        navItems.forEach(item => {
            item.classList.remove('active');
            const onclickStr = item.getAttribute('onclick');
            if (onclickStr && onclickStr.includes(currentId)) {
                item.classList.add('active');
            }
        });
    }
});
