// ===== SCRIPT.JS =====

// Problem-Solution Toggle
const toggleBtn = document.getElementById('toggleBtn');
const problemPanel = document.getElementById('problemPanel');
const solutionPanel = document.getElementById('solutionPanel');
let showingSolution = false;

if (toggleBtn && problemPanel && solutionPanel) {
    toggleBtn.addEventListener('click', () => {
        showingSolution = !showingSolution;

        if (showingSolution) {
            problemPanel.classList.add('hidden');
            solutionPanel.classList.add('active');
            toggleBtn.textContent = 'Вернуться к Проблем';
        } else {
            problemPanel.classList.remove('hidden');
            solutionPanel.classList.remove('active');
            toggleBtn.textContent = 'Показать Решение';
        }
    });
}

// Smooth Scroll for CTA Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);

        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll Animations for Elements
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe roadmap steps
document.querySelectorAll('.roadmap__step').forEach((step, index) => {
    step.style.opacity = '0';
    step.style.transform = 'translateY(30px)';
    step.style.transition = `all 0.6s ease ${index * 0.1}s`;
    fadeInObserver.observe(step);
});

// Observe pricing cards
document.querySelectorAll('.pricing__card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s ease ${index * 0.1}s`;
    fadeInObserver.observe(card);
});

// Demo Video Play Button
const playButton = document.getElementById('playButton');
const demoVideo = document.getElementById('demoVideo');

if (playButton && demoVideo) {
    playButton.addEventListener('click', () => {
        playButton.classList.add('hidden');
        demoVideo.play();
    });

    demoVideo.addEventListener('play', () => {
        playButton.classList.add('hidden');
    });

    demoVideo.addEventListener('pause', () => {
        if (demoVideo.currentTime < demoVideo.duration) {
            playButton.classList.remove('hidden');
        }
    });

    demoVideo.addEventListener('ended', () => {
        playButton.classList.remove('hidden');
    });
}

/* === TEAM CAROUSEL — ФОТО + АВТОСМЕНА === */

const teamMembers = [
    {
        name: 'Мухаммаджонов Бехруз Тохиржон угли',
        rolePrimary: 'Backend',
        roleSecondary: 'Developer',
        skills: ['Python', 'C++', 'JavaScript', 'Node.js', 'С#', '.Net', '.ASP', 'PostgreSQL', 'MS SQL', 'Server'],
        image: 'assets/images/team/behruz.png'
    },
    {
        name: 'Нормирзаев Билолиддин Анвар угли',
        rolePrimary: 'Fronted',
        roleSecondary: 'Developer',
        skills: ['Python', 'JavaScript', 'HTML/CSS', 'PostgreSQL', 'Node.js'],
        image: 'assets/images/team/billy.png'
    },
    {
        name: 'Мирмахмудов Фаррух Боходир угли',
        rolePrimary: 'UI/UX',
        roleSecondary: 'Designer',
        skills: ['UI/UX Design', 'Python', 'HTML/CSS', 'JavaScript', 'Graphic Design', 'SQL', 'Linux Administration'],
        image: 'assets/images/team/farruh.png'
    },
    {
        name: 'Сайдазимов Эмир-Саид Русланович',
        rolePrimary: 'Project',
        roleSecondary: 'Manager',
        skills: ['3D-моделирование', 'e-commerce (Shopify)', 'Python', 'HTML/CSS', 'JavaScript', 'React', 'Angular', 'PostgreSQl', 'MySql', 'Node.js'],
        image: 'assets/images/team/emir.png'
    },
    {
        name: 'Иброхимов Акмалхон Мирзохидович',
        rolePrimary: 'System',
        roleSecondary: 'Architect',
        skills: ['Android (Kotlin, Java)', 'Jetpack Compose', 'MVVM', 'Clean Architecture', 'Hilt (DI)', 'Retrofit', 'Room', 'Paging3', 'Flow', 'LiveData', 'Coroutine', 'Firebase', 'Git', 'Python', 'SQL'],
        image: 'assets/images/team/akmal.png'
    }
];

const teamCardsContainer = document.getElementById('teamCards');
const prevBtn = document.getElementById('prevMember');
const nextBtn = document.getElementById('nextMember');
const dotsContainer = document.getElementById('teamDots');

let currentTeamIndex = 0;
let teamCarouselInterval;

let teamSlides = [];
let dots = [];

// Генерация слайдов и точек
if (teamCardsContainer && dotsContainer) {
    teamMembers.forEach((member, index) => {
        const slide = document.createElement('div');
        slide.classList.add('team__slide');
        if (index === 0) slide.classList.add('team__slide--active');

        slide.innerHTML = `
            <div class="team__ring"></div>
            <div class="team__photo-circle">
                ${member.image
                ? `<img src="${member.image}" alt="${member.name}" class="team__photo-img">`
                : `<span class="team__photo-initials">${member.initials}</span>`
            }
            </div>
            <div class="team__role">
                <span class="team__role-word team__role-word--primary">${member.rolePrimary}</span>
                <span class="team__role-word team__role-word--secondary">${member.roleSecondary}</span>
            </div>
            <div class="team__name">${member.name}</div>
            <div class="team__skills-list">
                ${member.skills.map(skill => `<span class="team__skill">${skill}</span>`).join('')}
            </div>
        `;

        teamCardsContainer.appendChild(slide);
    });

    teamSlides = Array.from(document.querySelectorAll('.team__slide'));

    teamMembers.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('team__dot');
        if (index === 0) dot.classList.add('team__dot--active');
        dot.addEventListener('click', () => {
            showTeamMember(index);
            resetTeamCarousel();
        });
        dotsContainer.appendChild(dot);
    });

    dots = Array.from(document.querySelectorAll('.team__dot'));
}

function showTeamMember(index) {
    if (!teamSlides.length) return;

    teamSlides.forEach(slide => slide.classList.remove('team__slide--active'));
    dots.forEach(dot => dot.classList.remove('team__dot--active'));

    if (teamSlides[index]) {
        teamSlides[index].classList.add('team__slide--active');
    }
    if (dots[index]) {
        dots[index].classList.add('team__dot--active');
    }

    currentTeamIndex = index;
}

function startTeamCarousel() {
    if (!teamSlides.length) return;
    teamCarouselInterval = setInterval(() => {
        currentTeamIndex = (currentTeamIndex + 1) % teamSlides.length;
        showTeamMember(currentTeamIndex);
    }, 4000); // чуть быстрее, меньше «висящего» статичного кадра
}

function resetTeamCarousel() {
    clearInterval(teamCarouselInterval);
    startTeamCarousel();
}

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        if (!teamSlides.length) return;
        currentTeamIndex = (currentTeamIndex - 1 + teamSlides.length) % teamSlides.length;
        showTeamMember(currentTeamIndex);
        resetTeamCarousel();
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        if (!teamSlides.length) return;
        currentTeamIndex = (currentTeamIndex + 1) % teamSlides.length;
        showTeamMember(currentTeamIndex);
        resetTeamCarousel();
    });
}

// Pause auto-advance on hover
const teamCarousel = document.querySelector('.team__carousel');
if (teamCarousel) {
    teamCarousel.addEventListener('mouseenter', () => {
        clearInterval(teamCarouselInterval);
    });

    teamCarousel.addEventListener('mouseleave', () => {
        startTeamCarousel();
    });
}

// Запуск карусели
if (teamSlides.length) {
    showTeamMember(0);
    startTeamCarousel();
}

// Animate chart bars on scroll
const chartBars = document.querySelectorAll('.chart-bar');
const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target;
            const targetHeight = bar.style.getPropertyValue('--height');
            bar.style.height = '0';

            setTimeout(() => {
                bar.style.transition = 'height 1s ease';
                bar.style.height = targetHeight;
            }, 100);
        }
    });
}, { threshold: 0.3 });

chartBars.forEach(bar => {
    chartObserver.observe(bar);
});

// Enhanced scroll snap behavior for better control
const scrollContainer = document.querySelector('.scroll-container');
let isScrolling;

if (scrollContainer) {
    scrollContainer.addEventListener('scroll', () => {
        window.clearTimeout(isScrolling);

        isScrolling = setTimeout(() => {
            const sections = document.querySelectorAll('.section-fullscreen');
            const scrollTop = scrollContainer.scrollTop;

            let closestSection = null;
            let minDistance = Infinity;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const distance = Math.abs(scrollTop - sectionTop);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestSection = section;
                }
            });

            if (closestSection && minDistance > 50) {
                closestSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 150);
    }, false);
}

// Prevent rapid scroll events from causing issues
let lastScrollTime = 0;
const scrollThrottle = 100; // milliseconds

if (scrollContainer) {
    scrollContainer.addEventListener('wheel', () => {
        const now = Date.now();
        if (now - lastScrollTime < scrollThrottle) {
            return;
        }
        lastScrollTime = now;
    }, { passive: true });
}

// Add hover effect to tech badges
document.querySelectorAll('.tech__badge').forEach(badge => {
    badge.addEventListener('mouseenter', function () {
        this.style.transform = 'scale(1.1) rotate(2deg)';
    });

    badge.addEventListener('mouseleave', function () {
        this.style.transform = 'scale(1) rotate(0)';
    });
});

console.log('Fullscreen presentation website loaded successfully with animated team block and auto-rotation.');
