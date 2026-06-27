// Smooth Scroll & Navigation Active State
function navTo(e, id) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const headerEl = document.querySelector('.app-header');
    const headerH = headerEl ? headerEl.offsetHeight : 65;
    const top = el.getBoundingClientRect().top + window.pageYOffset - headerH - 16;
    window.scrollTo({ top, behavior: 'smooth' });
    
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    e.currentTarget.classList.add('active');
}

// Highlight sidebar menu items when scrolling sections
document.addEventListener('DOMContentLoaded', () => {
    const sectionIds = ['scope', 'roles', 'architecture', 'modules', 'flows', 'unknowns'];
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                const link = document.querySelector(`.nav-link[onclick*="'${entry.target.id}'"]`);
                if (link) link.classList.add('active');
            }
        });
    }, { threshold: 0.15, rootMargin: '-80px 0px -60% 0px' });

    sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) io.observe(el);
    });
    
    // Initialize Mermaid Zoom/Pan if script is imported
    if (window.mermaid) {
        initAllDiagrams();
    }
});

/* ============ MERMAID ZOOM/PAN ENGINE ============ */
const config = {
    fitPadding: 28,
    minHeight: 360,
    maxHeightPx: 960,
    maxHeightVh: 0.84,
    maxInitialZoom: 1.8,
    minZoom: 0.08,
    maxZoom: 6.5,
    zoomStep: 0.14,
    readabilityFloor: 0.58
};

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
let activeDrag = null;

addEventListener('mousemove', (e) => activeDrag?.onMove(e));
addEventListener('mouseup', () => {
    activeDrag?.onEnd();
    activeDrag = null;
});

function initAllDiagrams() {
    // Custom Mermaid init styles
    const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
    window.mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: '15px',
            primaryColor: isDark ? '#1e293b' : '#eff6ff',
            primaryBorderColor: isDark ? '#3b82f6' : '#1e3a8a',
            primaryTextColor: isDark ? '#f1f5f9' : '#0f172a',
            lineColor: isDark ? '#475569' : '#94a3b8',
            secondaryColor: isDark ? '#115e59' : '#f0fdf4',
            secondaryBorderColor: isDark ? '#14b8a6' : '#16a34a',
            secondaryTextColor: isDark ? '#ccfbf1' : '#14532d',
            tertiaryColor: isDark ? '#2e2618' : '#fffbeb',
            tertiaryBorderColor: isDark ? '#fbbf24' : '#d97706',
            tertiaryTextColor: isDark ? '#fef3c7' : '#78350f'
        }
    });

    document.querySelectorAll('.diagram-shell').forEach(initDiagram);
}

function initDiagram(shell) {
    const wrap = shell.querySelector('.mermaid-wrap');
    const viewport = shell.querySelector('.mermaid-viewport');
    const canvas = shell.querySelector('.mermaid-canvas');
    const source = shell.querySelector('.diagram-source');
    const label = shell.querySelector('.zoom-label');

    if (!wrap || !viewport || !canvas || !source || !label) {
        console.error('initDiagram: missing elements', shell);
        return;
    }

    let zoom = 1;
    let fitMode = 'contain';
    let panX = 0;
    let panY = 0;
    let svgW = 0;
    let svgH = 0;

    let sx = 0, sy = 0, spx = 0, spy = 0;
    let touchDist = 0, touchCx = 0, touchCy = 0;

    function constrainPan() {
        const vpW = viewport.clientWidth;
        const vpH = viewport.clientHeight;
        const rW = svgW * zoom;
        const rH = svgH * zoom;
        const pad = config.fitPadding;

        panX = (rW + pad * 2 <= vpW)
            ? (vpW - rW) / 2
            : clamp(panX, vpW - rW - pad, pad);
        panY = (rH + pad * 2 <= vpH)
            ? (vpH - rH) / 2
            : clamp(panY, vpH - rH - pad, pad);
    }

    function applyTransform() {
        const svg = canvas.querySelector('svg');
        if (!svg || !svgW) return;

        constrainPan();
        svg.style.width = (svgW * zoom) + 'px';
        svg.style.height = (svgH * zoom) + 'px';
        canvas.style.transform = `translate(${panX}px, ${panY}px)`;
        label.textContent = Math.round(zoom * 100) + '% — ' + fitMode;
    }

    function canPan() {
        const rW = svgW * zoom;
        const rH = svgH * zoom;
        return rW + config.fitPadding * 2 > viewport.clientWidth
            || rH + config.fitPadding * 2 > viewport.clientHeight;
    }

    function computeSmartFit() {
        const vpW = viewport.clientWidth;
        const vpH = viewport.clientHeight;
        const aW = Math.max(80, vpW - config.fitPadding * 2);
        const aH = Math.max(80, vpH - config.fitPadding * 2);
        const contain = Math.min(aW / svgW, aH / svgH);

        let z = contain;
        let mode = 'contain';
        if (contain < config.readabilityFloor) {
            const chartR = svgH / svgW;
            const vpR = vpH / Math.max(vpW, 1);
            if (chartR >= vpR) {
                z = aW / svgW;
                mode = 'width';
            } else {
                z = aH / svgH;
                mode = 'height';
            }
        }
        return { zoom: clamp(z, config.minZoom, config.maxInitialZoom), mode };
    }

    function fitDiagram() {
        if (!svgW) return;
        const fit = computeSmartFit();
        zoom = fit.zoom;
        fitMode = fit.mode;
        panX = (viewport.clientWidth - svgW * zoom) / 2;
        panY = (viewport.clientHeight - svgH * zoom) / 2;
        applyTransform();
    }

    function setOneToOne() {
        zoom = 1;
        fitMode = '1:1';
        panX = (viewport.clientWidth - svgW * zoom) / 2;
        panY = (viewport.clientHeight - svgH * zoom) / 2;
        applyTransform();
    }

    function zoomAround(factor, cx, cy) {
        const next = clamp(zoom * factor, config.minZoom, config.maxZoom);
        const ratio = next / zoom;
        panX = cx - ratio * (cx - panX);
        panY = cy - ratio * (cy - panY);
        zoom = next;
        fitMode = 'custom';
        applyTransform();
    }

    function readSvgNaturalSize(svg) {
        let w = 0, h = 0;
        if (svg.viewBox?.baseVal?.width > 0) {
            w = svg.viewBox.baseVal.width;
            h = svg.viewBox.baseVal.height;
        }
        if (!w) {
            w = parseFloat(svg.getAttribute('width')) || 0;
            h = parseFloat(svg.getAttribute('height')) || 0;
        }
        if (!w) {
            const b = svg.getBBox();
            w = b.width;
            h = b.height;
        }
        if (!w) {
            const r = svg.getBoundingClientRect();
            w = r.width || 1000;
            h = r.height || 700;
        }
        if (!svg.getAttribute('viewBox')) {
            svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        }
        return { w, h };
    }

    function setAdaptiveHeight() {
        if (!svgW) return;
        const usableW = Math.max(280, wrap.getBoundingClientRect().width - 2);
        const idealH = (svgH / svgW) * usableW + config.fitPadding * 2;
        const maxVp = Math.floor(innerHeight * config.maxHeightVh);
        const hardMax = Math.min(config.maxHeightPx, Math.max(config.minHeight + 40, maxVp));
        wrap.style.height = Math.round(clamp(idealH, config.minHeight, hardMax)) + 'px';
    }

    function openInNewTab() {
        const svg = canvas.querySelector('svg');
        if (!svg) return;

        const clone = svg.cloneNode(true);
        clone.style.width = '';
        clone.style.height = '';

        const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
        const bg = isDark ? '#0b0f19' : '#f8fafc';

        const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8">
        <title>Sơ đồ đặc tả MVP</title><style>
        body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
        background:${bg};padding:40px;box-sizing:border-box}
        svg{max-width:100%;max-height:90vh;height:auto}
        </style></head><body>${clone.outerHTML}</body></html>`;

        open(URL.createObjectURL(new Blob([html], { type: 'text/html' })), '_blank');
    }

    async function render() {
        try {
            const code = source.textContent.trim();
            if (!code) {
                label.textContent = 'Trống';
                return;
            }

            const id = 'diagram-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
            const { svg } = await window.mermaid.render(id, code);
            
            const parsed = new DOMParser().parseFromString(svg, 'text/html');
            const parsedSvg = parsed.body.querySelector('svg');
            if (!parsedSvg) {
                label.textContent = 'Lỗi render';
                return;
            }
            canvas.replaceChildren(document.adoptNode(parsedSvg));

            const svgNode = canvas.querySelector('svg');
            if (!svgNode) return;

            const size = readSvgNaturalSize(svgNode);
            svgW = size.w;
            svgH = size.h;

            svgNode.removeAttribute('width');
            svgNode.removeAttribute('height');
            svgNode.style.maxWidth = 'none';
            svgNode.style.display = 'block';

            setAdaptiveHeight();
            fitDiagram();
        } catch (err) {
            console.error('Mermaid render failed:', err);
            label.textContent = 'Lỗi: ' + (err.message || 'Lỗi render');
        }
    }

    const actions = {
        'zoom-in': () => zoomAround(1 + config.zoomStep, viewport.clientWidth / 2, viewport.clientHeight / 2),
        'zoom-out': () => zoomAround(1 / (1 + config.zoomStep), viewport.clientWidth / 2, viewport.clientHeight / 2),
        'zoom-fit': fitDiagram,
        'zoom-one': setOneToOne,
        'zoom-expand': openInNewTab
    };

    Object.entries(actions).forEach(([action, handler]) => {
        wrap.querySelector(`[data-action="${action}"]`)?.addEventListener('click', handler);
    });

    viewport.addEventListener('dblclick', fitDiagram);

    viewport.addEventListener('wheel', (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const rect = viewport.getBoundingClientRect();
            const factor = e.deltaY < 0 ? 1 + config.zoomStep : 1 / (1 + config.zoomStep);
            zoomAround(factor, e.clientX - rect.left, e.clientY - rect.top);
            return;
        }
        if (canPan()) {
            e.preventDefault();
            panX -= e.deltaX;
            panY -= e.deltaY;
            applyTransform();
        }
    }, { passive: false });

    viewport.addEventListener('mousedown', (e) => {
        if (e.target.closest('.zoom-controls') || !canPan()) return;
        wrap.classList.add('is-panning');
        sx = e.clientX;
        sy = e.clientY;
        spx = panX;
        spy = panY;
        e.preventDefault();

        activeDrag = {
            onMove: (ev) => {
                panX = spx + (ev.clientX - sx);
                panY = spy + (ev.clientY - sy);
                applyTransform();
            },
            onEnd: () => {
                wrap.classList.remove('is-panning');
            }
        };
    });

    viewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            sx = e.touches[0].clientX;
            sy = e.touches[0].clientY;
            spx = panX;
            spy = panY;
        } else if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            touchDist = Math.sqrt(dx * dx + dy * dy);
            const r = viewport.getBoundingClientRect();
            touchCx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
            touchCy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
        }
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && canPan()) {
            if (touchDist > 0) {
                sx = e.touches[0].clientX;
                sy = e.touches[0].clientY;
                spx = panX;
                spy = panY;
                touchDist = 0;
            }
            e.preventDefault();
            panX = spx + (e.touches[0].clientX - sx);
            panY = spy + (e.touches[0].clientY - sy);
            applyTransform();
        } else if (e.touches.length === 2 && touchDist > 0) {
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const d = Math.sqrt(dx * dx + dy * dy);
            zoomAround(d / touchDist, touchCx, touchCy);
            touchDist = d;
        }
    }, { passive: false });

    new ResizeObserver(() => {
        if (svgW) {
            setAdaptiveHeight();
            fitDiagram();
        }
    }).observe(wrap);

    render();
}
