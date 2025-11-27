// app.js — side-dots, snap navigation, resolve toggle, solution modal
(function () {
    // init once DOM готов
    function init() {
        // --- helpers / elements ---
        const container = document.getElementById('snap') || document.scrollingElement || document.documentElement;
        const dots = Array.from(document.querySelectorAll('.side-dots .dot'));
        const sections = dots.map(d => document.getElementById(d.dataset.target)).filter(Boolean);

        // Resolve panel elements
        const switcher = document.getElementById('resolveSwitcher');
        const resolveBtn = document.getElementById('resolveToggle');
        const panelProblem = document.getElementById('panelProblem');
        const panelSolution = document.getElementById('panelSolution');

        // Modal elements
        const openSolutionModalBtn = document.getElementById('openSolutionModalBtn');
        const modalSolutionDetail = document.getElementById('modalSolutionDetail');

        // --- Side dots navigation ---
        function setActiveDot(index) {
            dots.forEach((d, i) => {
                const active = i === index;
                d.classList.toggle('active', active);
                d.setAttribute('aria-current', active ? 'true' : 'false');
            });
        }

        // click -> scroll
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const id = dot.dataset.target;
                const el = document.getElementById(id);
                if (!el) return;
                if (container === document.scrollingElement || container === document.documentElement) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    container.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
                }
            });
        });

        // IntersectionObserver to highlight dots
        if (sections.length && 'IntersectionObserver' in window) {
            const ioOptions = {
                root: (container === document.scrollingElement || container === document.documentElement) ? null : container,
                rootMargin: '0px 0px -40% 0px',
                threshold: 0.001
            };
            const io = new IntersectionObserver((entries) => {
                const visible = entries.filter(e => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
                if (visible) {
                    const idx = sections.indexOf(visible.target);
                    if (idx >= 0) setActiveDot(idx);
                    return;
                }
                // fallback: nearest by scrollTop
                const scrollTop = (container === document.scrollingElement || container === document.documentElement) ? window.scrollY : container.scrollTop;
                let bestIdx = 0, bestDiff = Infinity;
                sections.forEach((s, i) => {
                    const top = s.offsetTop;
                    const diff = Math.abs(top - scrollTop);
                    if (diff < bestDiff) { bestDiff = diff; bestIdx = i; }
                });
                setActiveDot(bestIdx);
            }, ioOptions);
            sections.forEach(s => s && io.observe(s));
        } else {
            // simple fallback: activate first
            setActiveDot(0);
        }

        // Initial highlight after small delay (layout)
        window.setTimeout(() => {
            if (sections.length) {
                const scrollTop = (container === document.scrollingElement || container === document.documentElement) ? window.scrollY : container.scrollTop;
                let best = 0, bestDiff = Infinity;
                sections.forEach((sec, i) => {
                    const top = sec.offsetTop;
                    const diff = Math.abs(top - scrollTop);
                    if (diff < bestDiff) { best = i; bestDiff = diff; }
                });
                setActiveDot(best);
            }
        }, 80);

        // Keyboard nav (arrows/page/home/end)
        window.addEventListener('keydown', (e) => {
            const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'];
            if (!keys.includes(e.key)) return;
            const tag = (document.activeElement && document.activeElement.tagName) || '';
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
            e.preventDefault();
            const curr = dots.findIndex(d => d.classList.contains('active'));
            if (curr === -1) return;
            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                const next = Math.min(dots.length - 1, curr + 1);
                dots[next].click();
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                const prev = Math.max(0, curr - 1);
                dots[prev].click();
            } else if (e.key === 'Home') {
                dots[0].click();
            } else if (e.key === 'End') {
                dots[dots.length - 1].click();
            }
        });

        // Wheel snapping guard (throttled)
        (function wheelGuard() {
            if (!container || sections.length === 0) return;
            let isThrottled = false;
            function getIndex() {
                const st = (container === document.scrollingElement || container === document.documentElement) ? window.scrollY : container.scrollTop;
                let best = 0, bd = Infinity;
                sections.forEach((s, i) => {
                    const d = Math.abs(s.offsetTop - st);
                    if (d < bd) { bd = d; best = i; }
                });
                return best;
            }
            container.addEventListener('wheel', (e) => {
                if (isThrottled) return;
                const delta = e.deltaY;
                if (Math.abs(delta) < 10) return;
                isThrottled = true;
                const dir = delta > 0 ? 1 : -1;
                const idx = Math.max(0, Math.min(sections.length - 1, getIndex() + dir));
                sections[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(() => isThrottled = false, 520);
            }, { passive: true });
        })();

        // Touch swipe support
        (function touchGuard() {
            if (sections.length === 0) return;
            let startY = null;
            const threshold = 40;
            window.addEventListener('touchstart', (e) => {
                if (e.touches && e.touches.length) startY = e.touches[0].clientY;
            }, { passive: true });
            window.addEventListener('touchend', (e) => {
                if (startY === null) return;
                const endY = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : 0;
                const diff = startY - endY;
                if (Math.abs(diff) < threshold) { startY = null; return; }
                const curr = dots.findIndex(d => d.classList.contains('active'));
                if (curr === -1) { startY = null; return; }
                if (diff > 0) { // swipe up -> next
                    const next = Math.min(dots.length - 1, curr + 1);
                    dots[next].click();
                } else { // swipe down -> prev
                    const prev = Math.max(0, curr - 1);
                    dots[prev].click();
                }
                startY = null;
            }, { passive: true });
        })();

        // --- Resolve panel toggle (problem -> solution) ---
        if (switcher && resolveBtn && panelProblem && panelSolution) {
            function setToProblem() {
                switcher.setAttribute('data-state', 'problem');
                panelProblem.setAttribute('aria-hidden', 'false');
                panelSolution.setAttribute('aria-hidden', 'true');
                resolveBtn.setAttribute('aria-pressed', 'false');
                resolveBtn.textContent = 'Показать решение';
                panelProblem.focus({ preventScroll: true });
            }
            function setToSolution() {
                switcher.setAttribute('data-state', 'solution');
                panelProblem.setAttribute('aria-hidden', 'true');
                panelSolution.setAttribute('aria-hidden', 'false');
                resolveBtn.setAttribute('aria-pressed', 'true');
                resolveBtn.textContent = 'Закрыть решение';
                panelSolution.focus({ preventScroll: true });
            }

            // initial
            setToProblem();

            resolveBtn.addEventListener('click', () => {
                const state = switcher.getAttribute('data-state');
                if (state === 'problem') setToSolution(); else setToProblem();
            });

            resolveBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    resolveBtn.click();
                }
            });

            // ESC closes solution
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') setToProblem();
            });

            // Reset to problem when leaving section
            const resolveSection = document.getElementById('section-resolve');
            if (resolveSection && 'IntersectionObserver' in window) {
                const ro = new IntersectionObserver(entries => {
                    entries.forEach(en => { if (!en.isIntersecting) setToProblem(); });
                }, { root: null, threshold: 0.2 });
                ro.observe(resolveSection);
            }
        }

        // --- Solution detail modal logic ---
        if (openSolutionModalBtn && modalSolutionDetail) {
            const opener = openSolutionModalBtn;
            const modal = modalSolutionDetail;

            function openModal(m) {
                m.setAttribute('aria-hidden', 'false');
                const focusable = m.querySelector('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusable) focusable.focus();
                trapFocus(m);
            }
            function closeModal(m) {
                m.setAttribute('aria-hidden', 'true');
                releaseFocusTrap(m);
                try { opener.focus(); } catch (e) { }
            }

            opener.addEventListener('click', () => openModal(modal));

            modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => closeModal(modal)));
            modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal(modal);
            });

            // focus trap helpers
            function trapFocus(m) {
                const focusables = Array.from(m.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])'))
                    .filter(el => !el.hasAttribute('disabled'));
                if (!focusables.length) return;
                const first = focusables[0], last = focusables[focusables.length - 1];
                function handle(e) {
                    if (e.key !== 'Tab') return;
                    if (e.shiftKey) {
                        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
                    } else {
                        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
                    }
                }
                m.__trap = handle;
                m.addEventListener('keydown', handle);
            }
            function releaseFocusTrap(m) {
                if (!m.__trap) return;
                m.removeEventListener('keydown', m.__trap);
                delete m.__trap;
            }
        }

        // remove legacy canvas element if present (safety)
        const oldCanvas = document.getElementById('focAI');
        if (oldCanvas) {
            try { oldCanvas.remove(); } catch (e) { /* ignore */ }
        }
    } // end init

    // run init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
