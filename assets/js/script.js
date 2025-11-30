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
            toggleBtn.textContent = 'Back to Problem';
        } else {
            problemPanel.classList.remove('hidden');
            solutionPanel.classList.remove('active');
            toggleBtn.textContent = 'Show Solution';
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

// Team Carousel
const teamCards = document.querySelectorAll('.team__card');
const prevBtn = document.getElementById('prevMember');
const nextBtn = document.getElementById('nextMember');
const dotsContainer = document.getElementById('teamDots');
let currentTeamIndex = 0;
let teamCarouselInterval;

// Create dots for team members
teamCards.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('team__dot');
    if (index === 0) dot.classList.add('team__dot--active');
    dot.addEventListener('click', () => {
        showTeamMember(index);
        resetTeamCarousel();
    });
    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.team__dot');

function showTeamMember(index) {
    // Remove active class from all cards and dots
    teamCards.forEach(card => card.classList.remove('team__card--active'));
    dots.forEach(dot => dot.classList.remove('team__dot--active'));

    // Add active class to current card and dot
    if (teamCards[index]) {
        teamCards[index].classList.add('team__card--active');
    }
    if (dots[index]) {
        dots[index].classList.add('team__dot--active');
    }

    currentTeamIndex = index;
}

function startTeamCarousel() {
    teamCarouselInterval = setInterval(() => {
        currentTeamIndex = (currentTeamIndex + 1) % teamCards.length;
        showTeamMember(currentTeamIndex);
    }, 5000);
}

function resetTeamCarousel() {
    clearInterval(teamCarouselInterval);
    startTeamCarousel();
}

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        currentTeamIndex = (currentTeamIndex - 1 + teamCards.length) % teamCards.length;
        showTeamMember(currentTeamIndex);
        resetTeamCarousel();
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        currentTeamIndex = (currentTeamIndex + 1) % teamCards.length;
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

// Start team carousel
startTeamCarousel();

// Animate chart bars on scroll
const chartBars = document.querySelectorAll('.chart-bar');
const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target;
            const targetHeight = bar.style.getPropertyValue('--height');
            bar.style.height = '0';

            // Trigger animation
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
        // Clear the timeout if it exists
        window.clearTimeout(isScrolling);

        // Set a timeout to run after scrolling ends
        isScrolling = setTimeout(() => {
            // Scroll has stopped - snap to nearest section
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

            // Only snap if we're not already close enough
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
    scrollContainer.addEventListener('wheel', (e) => {
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
        this.style.transform = 'scale(1) rotate(0deg)';
    });
});

// Initialize - Show first team member
showTeamMember(0);

console.log('Fullscreen presentation website loaded successfully! 🚀');