const ANIMATION_DURATION = 1200;

function getPentagonPoints(cx, cy, r, rotation = -Math.PI / 2) {
  const points = [];
  for (let i = 0; i < 5; i++) {
    const angle = rotation + (i / 5) * Math.PI * 2;
    points.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r
    });
  }
  return points;
}

function drawPentagonGrid(ctx, cx, cy, maxR, levels) {
  const baseRotation = -Math.PI / 2;
  for (let level = 1; level <= levels; level++) {
    const r = (maxR / levels) * level;
    const pts = getPentagonPoints(cx, cy, r, baseRotation);
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      if (i === 0) ctx.moveTo(pts[i].x, pts[i].y);
      else ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(212, 168, 75, ${0.08 + level * 0.04})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
}

function drawAxes(ctx, cx, cy, r) {
  const baseRotation = -Math.PI / 2;
  for (let i = 0; i < 5; i++) {
    const angle = baseRotation + (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    ctx.strokeStyle = 'rgba(212, 168, 75, 0.15)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
}

function drawLabels(ctx, cx, cy, r, labels) {
  const baseRotation = -Math.PI / 2;
  ctx.font = '14px "WorkSans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < 5; i++) {
    const angle = baseRotation + (i / 5) * Math.PI * 2;
    const labelR = r * 1.15;
    const lx = cx + Math.cos(angle) * labelR;
    const ly = cy + Math.sin(angle) * labelR;
    ctx.fillStyle = 'rgba(212, 168, 75, 0.7)';
    ctx.fillText(labels[i], lx, ly);
  }
}

function drawDataPolygon(ctx, cx, cy, maxR, data, progress) {
  const baseRotation = -Math.PI / 2;
  const scaledData = data.map(v => (v / 100) * maxR * progress);
  const pts = getPentagonPoints(cx, cy, 1, baseRotation);

  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const r = scaledData[i];
    const angle = baseRotation + (i / 5) * Math.PI * 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
  grad.addColorStop(0, 'rgba(212, 168, 75, 0.3)');
  grad.addColorStop(0.5, 'rgba(212, 168, 75, 0.15)');
  grad.addColorStop(1, 'rgba(212, 168, 75, 0.05)');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = 'rgba(212, 168, 75, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  for (let i = 0; i < 5; i++) {
    const r = scaledData[i];
    const angle = baseRotation + (i / 5) * Math.PI * 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#d4a84b';
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 168, 75, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawValueLabels(ctx, cx, cy, maxR, data, progress) {
  const baseRotation = -Math.PI / 2;
  const scaledData = data.map(v => (v / 100) * maxR * progress);
  ctx.font = '11px "WorkSans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < 5; i++) {
    const r = scaledData[i];
    const angle = baseRotation + (i / 5) * Math.PI * 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    ctx.fillStyle = 'rgba(212, 168, 75, 0.8)';
    ctx.fillText(Math.round(data[i]), x - Math.cos(angle) * 16, y - Math.sin(angle) * 16);
  }
}

export function drawRadarChart(canvasId, data, labels) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const size = Math.min(rect.width, rect.height || 360);
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.35;
  const startTime = performance.now();

  function render() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    ctx.clearRect(0, 0, size, size);

    drawPentagonGrid(ctx, cx, cy, maxR, 5);
    drawAxes(ctx, cx, cy, maxR);
    drawLabels(ctx, cx, cy, maxR, labels);
    drawDataPolygon(ctx, cx, cy, maxR, data, eased);
    drawValueLabels(ctx, cx, cy, maxR, data, eased);

    if (progress < 1) {
      requestAnimationFrame(render);
    }
  }

  render();
}
