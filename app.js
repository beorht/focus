document.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('memberCard');
    const body = document.body;

    if (!card) return;

    const photoEl = card.querySelector('.member-photo');
    const roleLeftEl = card.querySelector('.role-left');
    const roleRightEl = card.querySelector('.role-right');
    const fullNameEl = card.querySelector('.full-name');
    const shortNameEl = card.querySelector('.short-name');
    const skillsListEl = card.querySelector('.skills-block ul');
    const teamLeadEl = card.querySelector('.team-lead-text');

    const prevBtn = card.querySelector('.nav-btn.prev');
    const nextBtn = card.querySelector('.nav-btn.next');

    // 5 участников
    const members = [
        {
            teamLead: 'team lead',
            roleLeft: 'Backend',
            roleRight: 'Developer',
            fullName: 'Мухаммаджонов',
            shortName: 'Бехруз Тохиржон угли',
            photo: 'behruz.png',
            bg: '#1d1d1d',
            skills: [
                'Python, C++',
                'JavaScript, Node.js, C#',
                '.Net ASP, PostgreSQL',
                'MS SQL Server'
            ]
        },
        {
            roleLeft: 'Frontend',
            roleRight: 'Developer',
            fullName: 'Нормирзаев',
            shortName: 'Билолиддин Анвар угли',
            photo: 'billy.png',
            bg: '#2b1239',
            skills: [
                'HTML, CSS, Sass',
                'JavaScript, TypeScript',
                'React, Vite',
                'Figma, UI-kit'
            ]
        },
        {
            teamLead: 'UI/UX Designer',
            roleLeft: 'Fronted',
            roleRight: 'Developer',
            fullName: 'Мирмахмудов',
            shortName: 'Фаррух Боходир угли',
            photo: 'farruh.png',
            bg: '#12323f',
            skills: [
                'UI/UX Design',
                'HTML/CSS, graph deisgn',
                'Fronted',
                'Scss/less, JavaScript'
            ]
        },
        {
            roleLeft: 'Project',
            roleRight: 'Manager',
            fullName: 'Сайдазимов',
            shortName: 'Эмир-Саид Русланович',
            photo: 'emir.png',
            bg: '#19331f',
            skills: [
                '3D-моделирование, Python',
                'HTML/CSS, JavaScript',
                'React, Angular',
                'PostgreSQl, MySql',
                'Node.js'
            ]
        },
        {
            roleLeft: 'System',
            roleRight: 'Architect',
            fullName: 'Иброхимов',
            shortName: 'Акмалхон Мирзохидович',
            photo: 'akmal.png',
            bg: '#33301f',
            skills: [
                'Android (Kotlin, Java), Jetpack Compose',
                'MVVM',
                'Clean Architecture',
                'Hilt (DI), Retrofit',
                'Room, Paging3',
                'Flow, LiveData',
                'Coroutine, Firebase',
                'Git, Python', 'SQL'
            ]
        }
    ];

    let currentIndex = 0;
    const AUTO_DELAY = 5000;       // автопереключение каждые 9 секунд
    const EXIT_DURATION = 1000;    // время «ухода» старого участника (должно быть ≤ твоих transition ~1s)
    const SCROLL_THROTTLE = 800;   // задержка между обработкой прокрутки
    let autoTimer = null;
    let isAnimating = false;
    let lastScrollTime = 0;

    function renderMember(index) {
        const m = members[index];

        if (teamLeadEl) teamLeadEl.textContent = m.teamLead || '';

        if (photoEl) {
            photoEl.src = m.photo || '';
            photoEl.alt = m.fullName || 'Фото участника';
        }

        if (roleLeftEl) roleLeftEl.textContent = m.roleLeft || '';
        if (roleRightEl) roleRightEl.textContent = m.roleRight || '';

        if (fullNameEl) fullNameEl.textContent = m.fullName || '';
        if (shortNameEl) shortNameEl.textContent = m.shortName || '';

        if (skillsListEl) {
            skillsListEl.innerHTML = '';
            (m.skills || []).forEach(skill => {
                const li = document.createElement('li');
                li.textContent = skill;
                skillsListEl.appendChild(li);
            });
        }

        if (body && m.bg) {
            body.style.backgroundColor = m.bg;
        }
    }

    // Запуск той же анимации, что и при первой загрузке (через класс .animate)
    function playCardAnimation() {
        card.classList.remove('animate');
        // форсируем reflow, чтобы браузер применил состояние без .animate
        void card.offsetWidth;
        // снова включаем .animate — все твои transition/transform/opacity запустятся как при загрузке
        card.classList.add('animate');
    }

    function goToMember(targetIndex, { fromAuto = false } = {}) {
        if (isAnimating) return; // защита от спама кликов/скролла

        const normalizedIndex = (targetIndex + members.length) % members.length;
        isAnimating = true;

        // 1) старый участник "уходит": remove .animate => твои переходы к исходному состоянию
        card.classList.remove('animate');

        setTimeout(() => {
            // 2) меняем данные на нового участника, пока блок уже "ушёл"
            currentIndex = normalizedIndex;
            renderMember(currentIndex);

            // 3) запускаем ту же анимацию появления
            requestAnimationFrame(() => {
                playCardAnimation();
                isAnimating = false;
            });
        }, EXIT_DURATION);

        // при ручном взаимодействии сбрасываем автопрокрутку
        if (!fromAuto) {
            restartAutoTimer();
        }
    }

    function showNext(options) {
        goToMember(currentIndex + 1, options);
    }

    function showPrev(options) {
        goToMember(currentIndex - 1, options);
    }

    function restartAutoTimer() {
        if (autoTimer) {
            clearInterval(autoTimer);
        }
        autoTimer = setInterval(() => {
            // auto-переходы не сбрасывают таймер заново
            showNext({ fromAuto: true });
        }, AUTO_DELAY);
    }

    // Клики по стрелкам
    if (nextBtn) {
        nextBtn.addEventListener('click', () => showNext({ fromAuto: false }));
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => showPrev({ fromAuto: false }));
    }

    // Прокрутка колёсиком: вниз — следующий, вверх — предыдущий
    window.addEventListener('wheel', (event) => {
        const now = Date.now();
        if (now - lastScrollTime < SCROLL_THROTTLE) return;

        if (event.deltaY > 0) {
            showNext({ fromAuto: false });
        } else if (event.deltaY < 0) {
            showPrev({ fromAuto: false });
        }

        lastScrollTime = now;
    }, { passive: true });

    // Инициализация: первый участник
    renderMember(currentIndex);

    // Первая анимация, как у тебя было изначально
    setTimeout(() => {
        playCardAnimation();
    }, 100);

    // Старт автопереключения
    restartAutoTimer();
});
