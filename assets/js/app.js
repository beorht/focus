// app.js — side-dots, snap navigation, resolve toggle, solution modal
(function () {
    function init() {
        const container = document.getElementById('snap') || document.scrollingElement || document.documentElement;
        const dots = Array.from(document.querySelectorAll('.side-dots .dot'));
        const sections = dots.map(d => document.getElementById(d.dataset.target)).filter(Boolean);

        if (!sections.length) return;

        // CTA-кнопки
        const btnPlan = document.getElementById('btnPlan');
        const btnDemo = document.getElementById('btnDemo');

        // Resolve panel
        const switcher = document.getElementById('resolveSwitcher');
        const resolveBtn = document.getElementById('resolveToggle');
        const panelProblem = document.getElementById('panelProblem');
        const panelSolution = document.getElementById('panelSolution');

        // Modal
        const openSolutionModalBtn = document.getElementById('openSolutionModalBtn');
        const modalSolutionDetail = document.getElementById('modalSolutionDetail');

        let currentIndex = 0;
        let scrollSyncRaf = null;

        // --- helpers ---

        function setActiveDot(index) {
            dots.forEach((d, i) => {
                const active = i === index;
                d.classList.toggle('active', active);
                d.setAttribute('aria-current', active ? 'true' : 'false');
            });
        }

        function getScrollTop() {
            if (container === document.scrollingElement || container === document.documentElement) {
                return window.scrollY || window.pageYOffset || 0;
            }
            return container.scrollTop;
        }

        function goToSection(index) {
            if (index < 0 || index >= sections.length) return;
            currentIndex = index;
            const sec = sections[index];
            sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveDot(index);
        }

        function findNearestSectionIndex() {
            const st = getScrollTop();
            let best = 0;
            let bestDist = Infinity;
            sections.forEach((sec, i) => {
                const top = sec.offsetTop;
                const dist = Math.abs(top - st);
                if (dist < bestDist) {
                    bestDist = dist;
                    best = i;
                }
            });
            return best;
        }

        function syncCurrentFromScroll() {
            if (scrollSyncRaf !== null) return;
            scrollSyncRaf = window.requestAnimationFrame(() => {
                scrollSyncRaf = null;
                const idx = findNearestSectionIndex();
                if (idx !== currentIndex) {
                    currentIndex = idx;
                    setActiveDot(idx);
                }
            });
        }

        // --- инициализация позиции/точки ---
        (function initPosition() {
            const idx = findNearestSectionIndex();
            currentIndex = idx;
            setActiveDot(idx);
            // мягко доводим до ближайшего блока при загрузке
            sections[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
        })();

        // --- Side dots navigation ---
        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                goToSection(idx);
            });
        });

        // --- CTA hero buttons ---
        if (btnPlan) {
            btnPlan.addEventListener('click', () => {
                const targetIndex = sections.findIndex(sec => sec && sec.id === 'section-resolve');
                if (targetIndex !== -1) goToSection(targetIndex);
            });
        }

        if (btnDemo) {
            btnDemo.addEventListener('click', () => {
                const targetIndex = sections.findIndex(sec => sec && sec.id === 'section-project');
                if (targetIndex !== -1) goToSection(targetIndex);
            });
        }

        // --- Keyboard nav ---
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

        // --- Scroll sync (если тянут вручную) ---
        container.addEventListener('scroll', syncCurrentFromScroll, { passive: true });

        // --- Wheel snapping: ОДНА секция за жест ---
        (function wheelGuard() {
            const threshold = 25;
            let lastStepTime = 0;
            const STEP_COOLDOWN = 900; // мс между шагами (убирает "перелистывание")

            container.addEventListener('wheel', (e) => {
                const delta = e.deltaY || 0;
                if (Math.abs(delta) < threshold) return;

                // полностью гасим нативный скролл
                e.preventDefault();

                const now = Date.now();
                if (now - lastStepTime < STEP_COOLDOWN) return;
                lastStepTime = now;

                // перед шагом синхронизируемся с реальной позицией
                const nearest = findNearestSectionIndex();
                currentIndex = nearest;

                const dir = delta > 0 ? 1 : -1;
                const targetIndex = Math.max(0, Math.min(sections.length - 1, currentIndex + dir));
                if (targetIndex !== currentIndex) {
                    goToSection(targetIndex);
                }
            }, { passive: false });
        })();

        // --- Touch swipe: тоже по одной секции ---
        (function touchGuard() {
            let startY = null;
            const threshold = 40;
            let lastSwipeTime = 0;
            const SWIPE_COOLDOWN = 700;

            window.addEventListener('touchstart', (e) => {
                if (e.touches && e.touches.length) startY = e.touches[0].clientY;
            }, { passive: true });

            window.addEventListener('touchend', (e) => {
                if (startY === null) return;
                const endY = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : 0;
                const diff = startY - endY;
                startY = null;

                if (Math.abs(diff) < threshold) return;

                const now = Date.now();
                if (now - lastSwipeTime < SWIPE_COOLDOWN) return;
                lastSwipeTime = now;

                const nearest = findNearestSectionIndex();
                currentIndex = nearest;

                if (diff > 0) {
                    goToSection(Math.min(dots.length - 1, currentIndex + 1));
                } else {
                    goToSection(Math.max(0, currentIndex - 1));
                }
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
                resolveBtn.textContent = 'Назад в проблемы';
                panelSolution.focus({ preventScroll: true });
            }

            // initial
            setToProblem();

            resolveBtn.addEventListener('click', () => {
                const state = switcher.getAttribute('data-state');
                if (state === 'problem') setToSolution();
                else setToProblem();
            });

            resolveBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    resolveBtn.click();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') setToProblem();
            });

            const resolveSection = document.getElementById('section-resolve');
            if (resolveSection && 'IntersectionObserver' in window) {
                const ro = new IntersectionObserver(entries => {
                    entries.forEach(en => {
                        if (!en.isIntersecting) setToProblem();
                    });
                }, {
                    root: container === document.documentElement ? null : container,
                    threshold: 0.2
                });
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

            modal.querySelectorAll('[data-close]').forEach(el =>
                el.addEventListener('click', () => closeModal(modal))
            );

            modal.addEventListener('click', (e) => {
                if (e.target.classList && e.target.classList.contains('modal-backdrop')) {
                    closeModal(modal);
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
                    closeModal(modal);
                }
            });

            function trapFocus(m) {
                const focusables = Array
                    .from(m.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])'))
                    .filter(el => !el.hasAttribute('disabled'));
                if (!focusables.length) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];

                function handle(e) {
                    if (e.key !== 'Tab') return;
                    if (e.shiftKey) {
                        if (document.activeElement === first) {
                            e.preventDefault();
                            last.focus();
                        }
                    } else {
                        if (document.activeElement === last) {
                            e.preventDefault();
                            first.focus();
                        }
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
            try { oldCanvas.remove(); } catch (e) { }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
