const ZODIAC_SYMBOLS = [
  '\u2648', '\u2649', '\u264A', '\u264B',
  '\u264C', '\u264D', '\u264E', '\u264F',
  '\u2650', '\u2651', '\u2652', '\u2653'
];
const ZODIAC_NAMES = [
  '\u767D\u7F8A\u5EA7', '\u91D1\u725B\u5EA7', '\u53CC\u5B50\u5EA7', '\u5DE8\u87F9\u5EA7',
  '\u72EE\u5B50\u5EA7', '\u5904\u5973\u5EA7', '\u5929\u79E4\u5EA7', '\u5929\u876E\u5EA7',
  '\u5C04\u624B\u5EA7', '\u6469\u7Faf\u5EA7', '\u6C34\u74F6\u5EA7', '\u53CC\u9C7C\u5EA7'
];

export class DestinyWheel {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.angle = 0;
    this.targetAngle = 0;
    this.isSpinning = false;
    this.onSpinEnd = null;
    this.size = 0;
    this.centerX = 0;
    this.centerY = 0;
    this.pulsePhase = 0;

    this.resize();
    this.bindEvents();
    this.animate();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.size = Math.min(rect.width, rect.height || 400);
    this.canvas.width = this.size * dpr;
    this.canvas.height = this.size * dpr;
    this.canvas.style.width = this.size + 'px';
    this.canvas.style.height = this.size + 'px';
    this.ctx.scale(dpr, dpr);
    this.centerX = this.size / 2;
    this.centerY = this.size / 2;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('click', (e) => this.spin(e));
  }

  spin(e) {
    if (this.isSpinning) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - this.centerX;
    const y = e.clientY - rect.top - this.centerY;
    const clickAngle = Math.atan2(y, x);
    const extraSpins = 4 + Math.random() * 3;
    this.targetAngle = this.angle + extraSpins * Math.PI * 2 + (Math.random() - 0.5) * Math.PI;
    this.spinVelocity = 0;
    this.spinStartAngle = this.angle;
    this.spinDuration = 2000 + Math.random() * 1000;
    this.spinStartTime = performance.now();
    this.isSpinning = true;
  }

  getResult() {
    const sliceAngle = (2 * Math.PI) / 12;
    const normalized = ((this.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const index = Math.floor(normalized / sliceAngle);
    return {
      index: (12 - index) % 12,
      symbol: ZODIAC_SYMBOLS[(12 - index) % 12],
      name: ZODIAC_NAMES[(12 - index) % 12]
    };
  }

  animate() {
    const now = performance.now();
    if (this.isSpinning) {
      const elapsed = now - this.spinStartTime;
      const progress = Math.min(elapsed / this.spinDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.angle = this.spinStartAngle + (this.targetAngle - this.spinStartAngle) * eased;
      if (progress >= 1) {
        this.isSpinning = false;
        this.angle = this.targetAngle;
        if (this.onSpinEnd) this.onSpinEnd(this.getResult());
      }
    }
    this.pulsePhase += 0.02;
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  draw() {
    const ctx = this.ctx;
    const s = this.size;
    const cx = this.centerX;
    const cy = this.centerY;
    const r = s * 0.42;

    ctx.clearRect(0, 0, s, s);

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    gradient.addColorStop(0, 'rgba(212, 168, 75, 0.05)');
    gradient.addColorStop(0.6, 'rgba(212, 168, 75, 0.02)');
    gradient.addColorStop(1, 'rgba(212, 168, 75, 0.08)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.angle);

    for (let i = 0; i < 12; i++) {
      const theta = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const nextTheta = ((i + 1) / 12) * Math.PI * 2 - Math.PI / 2;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r * 0.85, theta, nextTheta);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? 'rgba(212, 168, 75, 0.04)' : 'rgba(212, 168, 75, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 168, 75, 0.15)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    for (let ring = 0; ring < 3; ring++) {
      const ringR = r * (0.3 + ring * 0.3);
      ctx.beginPath();
      ctx.arc(0, 0, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(212, 168, 75, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (let i = 0; i < 72; i++) {
      const theta = (i / 72) * Math.PI * 2;
      const r1 = r * 0.88;
      const r2 = r * 0.95;
      ctx.beginPath();
      ctx.moveTo(Math.cos(theta) * r1, Math.sin(theta) * r1);
      ctx.lineTo(Math.cos(theta) * r2, Math.sin(theta) * r2);
      ctx.strokeStyle = i % 6 === 0 ? 'rgba(212, 168, 75, 0.6)' : 'rgba(212, 168, 75, 0.15)';
      ctx.lineWidth = i % 6 === 0 ? 1.5 : 0.5;
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(212, 168, 75, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(212, 168, 75, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 12; i++) {
      const theta = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const symR = r * 0.75;
      const nameR = r * 0.58;
      const labelR = r * 0.48;

      ctx.save();
      ctx.translate(Math.cos(theta) * symR, Math.sin(theta) * symR);
      ctx.font = `${r * 0.14}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#d4a84b';
      ctx.fillText(ZODIAC_SYMBOLS[i], 0, 0);
      ctx.restore();

      ctx.save();
      ctx.translate(Math.cos(theta) * nameR, Math.sin(theta) * nameR);
      ctx.font = `${r * 0.07}px "WorkSans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(212, 168, 75, 0.7)';
      ctx.fillText(ZODIAC_NAMES[i], 0, 0);
      ctx.restore();

      if (i % 3 === 0) {
        ctx.save();
        ctx.translate(Math.cos(theta) * labelR, Math.sin(theta) * labelR);
        ctx.font = `${r * 0.06}px "WorkSans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const elements = ['\u706B', '\u571F', '\u98CE', '\u6C34'];
        ctx.fillStyle = 'rgba(212, 168, 75, 0.4)';
        ctx.fillText(elements[Math.floor(i / 3)], 0, 0);
        ctx.restore();
      }
    }

    ctx.restore();

    const pointerPulse = Math.sin(this.pulsePhase) * 2;
    ctx.save();
    ctx.translate(cx, cy);

    const px = r * 0.98;
    ctx.beginPath();
    ctx.moveTo(px, -8 - pointerPulse);
    ctx.lineTo(px + 16, 0);
    ctx.lineTo(px, 8 + pointerPulse);
    ctx.closePath();
    ctx.fillStyle = '#d4a84b';
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 168, 75, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();

    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.16, 0, Math.PI * 2);
    const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.16);
    centerGrad.addColorStop(0, 'rgba(212, 168, 75, 0.4)');
    centerGrad.addColorStop(0.5, 'rgba(212, 168, 75, 0.15)');
    centerGrad.addColorStop(1, 'rgba(212, 168, 75, 0)');
    ctx.fillStyle = centerGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 168, 75, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.font = `${r * 0.09}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(212, 168, 75, 0.6)';
    ctx.fillText('\u2606', 0, 0);
    ctx.restore();

    if (!this.isSpinning) {
      ctx.save();
      ctx.font = `${r * 0.065}px "WorkSans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(212, 168, 75, 0.35)';
      ctx.fillText('\u70B9\u51FB\u65CB\u8F6C', cx, cy + r * 0.32);
      ctx.restore();
    }
  }

  destroy() {
    this.onSpinEnd = null;
  }
}
