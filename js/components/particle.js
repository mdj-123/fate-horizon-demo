const PARTICLE_COUNT = 120;
const CONNECTION_DISTANCE = 120;
const FLOAT_SPEED = 0.15;
const TWINKLE_SPEED = 0.02;

class StarParticle {
  constructor(w, h) {
    this.reset(w, h, true);
  }

  reset(w, h, init = false) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.size = Math.random() * 2.5 + 0.5;
    this.baseAlpha = Math.random() * 0.5 + 0.3;
    this.alpha = this.baseAlpha;
    this.speedX = (Math.random() - 0.5) * FLOAT_SPEED;
    this.speedY = (Math.random() - 0.5) * FLOAT_SPEED;
    this.twinklePhase = Math.random() * Math.PI * 2;
    this.twinkleSpeed = TWINKLE_SPEED + Math.random() * TWINKLE_SPEED;
    this.width = w;
    this.height = h;
  }

  update(w, h) {
    this.x += this.speedX;
    this.y += this.speedY;
    this.twinklePhase += this.twinkleSpeed;
    this.alpha = this.baseAlpha + Math.sin(this.twinklePhase) * 0.15;

    if (this.x < 0) this.x = w;
    if (this.x > w) this.x = 0;
    if (this.y < 0) this.y = h;
    if (this.y > h) this.y = 0;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(232, 224, 240, ${this.alpha})`;
    ctx.fill();

    if (this.size > 1.8) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 168, 75, ${this.alpha * 0.3})`;
      ctx.fill();
    }
  }
}

export class ParticleBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.isRunning = false;
    this.animFrameId = null;

    this.resize();
    this.initParticles();
    this.bindEvents();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.ctx.scale(dpr, dpr);
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      this.particles.push(new StarParticle(this.w, this.h));
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      for (const p of this.particles) {
        if (p.x > this.w) p.x = Math.random() * this.w;
        if (p.y > this.h) p.y = Math.random() * this.h;
        p.width = this.w;
        p.height = this.h;
      }
    });
  }

  drawConnections() {
    const ctx = this.ctx;
    const particles = this.particles;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DISTANCE) {
          const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(212, 168, 75, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.w, this.h);

    for (const p of this.particles) {
      p.update(this.w, this.h);
    }

    this.drawConnections();

    for (const p of this.particles) {
      p.draw(this.ctx);
    }

    if (this.isRunning) {
      this.animFrameId = requestAnimationFrame(() => this.render());
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.render();
  }

  stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  destroy() {
    this.stop();
    this.particles = [];
  }
}
