// app.js — side-dots, snap navigation, resolve toggle, solution modal
(function () {
    function init() {
        // --- helpers / elements ---
        const container = document.getElementById('snap') || document.scrollingElement || document.documentElement;
        const dots = Array.from(document.querySelectorAll('.side-dots .dot'));
        const sections = dots.map(d => document.getElementById(d.dataset.target)).filter(Boolean);

        // Если секций нет — выходим
        if (!sections.length) return;

        let currentIndex = 0;

        // Resolve panel elements
        const switcher = document.getElementById('resolveSwitcher');
        const resolveBtn = document.getElementById('resolveToggle');
        const panelProblem = document.getElementById('panelProblem');
        const panelSolution = document.getElementById('panelSolution');

        // Modal elements
        const openSolutionModalBtn = document.getElementById('openSolutionModalBtn');
        const modalSolutionDetail = document.getElementById('modalSolutionDetail');

        // --- helpers ---

        function setActiveDot(index) {
            dots.forEach((d, i) => {
                const active = i === index;
                d.classList.toggle('active', active);
                d.setAttribute('aria-current', active ? 'true' : 'false');
            });
        }

        function goToSection(index) {
            if (index < 0 || index >= sections.length) return;
            currentIndex = index;
            const sec = sections[index];

            if (container === document.scrollingElement || container === document.documentElement) {
                sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                container.scrollTo({ top: sec.offsetTop, behavior: 'smooth' });
            }

            setActiveDot(index);
        }

        // Инициализация позиции
        goToSection(0);

        // --- Side dots navigation ---

        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                goToSection(idx);
            });
        });

        // Keyboard nav (arrows/page/home/end)
        window.addEventListener('keydown', (e) => {
            const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'];
            if (!keys.includes(e.key)) return;
            const tag = (document.activeElement && document.activeElement.tagName) || '';
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
            e.preventDefault();

            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                goToSection(Math.min(dots.length - 1, currentIndex + 1));
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                goToSection(Math.max(0, currentIndex - 1));
            } else if (e.key === 'Home') {
                goToSection(0);
            } else if (e.key === 'End') {
                goToSection(dots.length - 1);
            }
        });

        // Wheel snapping: строго одна секция за жест
        (function wheelGuard() {
            let isLocked = false;
            const threshold = 25; // чувствительность колеса

            container.addEventListener('wheel', (e) => {
                if (isLocked) {
                    e.preventDefault();
                    return;
                }

                const delta = e.deltaY;

                if (Math.abs(delta) < threshold) return;

                // полностью отключаем нативный скролл и инерцию
                e.preventDefault();

                isLocked = true;
                const dir = delta > 0 ? 1 : -1;
                const targetIndex = Math.max(0, Math.min(sections.length - 1, currentIndex + dir));

                if (targetIndex !== currentIndex) {
                    goToSection(targetIndex);
                }

                // блокируем повторные срабатывания, пока идёт плавный скролл
                setTimeout(() => {
                    isLocked = false;
                }, 700);
            }, { passive: false });
        })();

        // Touch swipe support (также +- 1 секция)
        (function touchGuard() {
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

                if (diff > 0) { // swipe up -> next
                    goToSection(Math.min(dots.length - 1, currentIndex + 1));
                } else { // swipe down -> prev
                    goToSection(Math.max(0, currentIndex - 1));
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
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
