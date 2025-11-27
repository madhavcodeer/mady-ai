// ============================================
// MADY AI - PARTICLES ANIMATION
// Creates floating geometric particles
// ============================================

class ParticleSystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.particles = [];
        this.particleCount = 30; // Reduced for cleaner look
        this.init();
    }

    init() {
        if (!this.container) return;

        for (let i = 0; i < this.particleCount; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Premium styling via JS for randomness
        const size = Math.random() * 3 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.background = 'rgba(220, 38, 38, 0.4)'; // Crimson
        particle.style.position = 'absolute';
        particle.style.borderRadius = '50%';

        // Random positioning
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        particle.style.left = `${startX}%`;
        particle.style.top = `${startY}%`;

        // Animation
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        particle.style.animation = `float ${duration}s infinite linear ${delay}s`;
        particle.style.opacity = Math.random() * 0.5;

        this.container.appendChild(particle);
        this.particles.push(particle);
    }
}

// Initialize particles when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on landing page
    if (document.getElementById('particles-js')) {
        new ParticleSystem('particles-js');
    }
});

// Parallax effect for hero section
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.floating-card');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    cards.forEach((card, index) => {
        const speed = (index + 1) * 20;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;

        card.style.transform = `translate(${x}px, ${y}px)`;
    });
});
