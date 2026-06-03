const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let mouse = { x: null, y: null };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.alpha = Math.random() * 0.5 + 0.1;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.speedX = Math.random() * 0.5 - 0.25;
    }
    
    draw() {
        ctx.fillStyle = `rgba(0, 243, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
    
    update() {
        // Floating movement
        this.y += this.speedY;
        this.x += this.speedX;
        
        // Wrapping
        if(this.y > canvas.height) this.y = 0;
        if(this.y < 0) this.y = canvas.height;
        if(this.x > canvas.width) this.x = 0;
        if(this.x < 0) this.x = canvas.width;

        // Mouse interaction (repel gently)
        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let maxDistance = 150;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;

            if (distance < maxDistance) {
                this.x -= directionX * 0.5;
                this.y -= directionY * 0.5;
            }
        }
        
        this.draw();
    }
}

function initParticles() {
    particles = [];
    const particleCount = (canvas.width * canvas.height) / 10000;
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
    }
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

window.showParticles = function() {
    canvas.style.opacity = '1';
};
window.hideParticles = function() {
    canvas.style.opacity = '0';
};
