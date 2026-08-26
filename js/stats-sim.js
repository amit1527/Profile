/**
 * stats-sim.js - Interactive Statistics & Math Simulators for Amit's Site
 * 1. Cramér-Rao Lower Bound & Estimator Efficiency Visualizer
 * 2. Regularization Shrinkage (Ridge vs Lasso) Visualizer
 */

export function initStatsSimulators() {
  initCramerRaoSim();
  initRegularizationSim();
}

function initCramerRaoSim() {
  const canvas = document.getElementById('crb-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const nSlider = document.getElementById('crb-n');
  const nValueDisplay = document.getElementById('crb-n-val');
  const sigmaSlider = document.getElementById('crb-sigma');
  const sigmaValueDisplay = document.getElementById('crb-sigma-val');
  
  const crbDisplay = document.getElementById('crb-bound-val');
  const effDisplay = document.getElementById('crb-eff-val');

  function render() {
    const n = parseInt(nSlider.value, 10);
    const sigmaSq = parseFloat(sigmaSlider.value);

    nValueDisplay.textContent = n;
    sigmaValueDisplay.textContent = sigmaSq.toFixed(1);

    const crBound = sigmaSq / n;
    const fisherInfo = n / sigmaSq;
    
    // Simulate an efficient sample mean estimator variance with slight sample variance
    const sampleVarEst = crBound * 1.02; // UMVUE efficient estimator
    const efficiency = (crBound / sampleVarEst) * 100;

    if (crbDisplay) crbDisplay.textContent = crBound.toFixed(4);
    if (effDisplay) effDisplay.textContent = efficiency.toFixed(1) + "%";

    // Setup high DPI canvas scaling
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement.clientWidth || 600;
    const height = 240;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Grid lines & theme check
    const isDark = document.body.classList.contains('dark-mode');
    const axisColor = isDark ? '#6B7280' : '#A0AEC0';
    const textColor = isDark ? '#E5E7EB' : '#1C1B19';
    const boundColor = isDark ? '#F87171' : '#7A1F2B'; // Maroon / Red
    const estColor = isDark ? '#60A5FA' : '#2563EB';   // Blue

    const padding = 45;
    const graphW = width - padding * 2;
    const graphH = height - padding * 2;

    // Draw Axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = textColor;
    ctx.font = '11px "IBM Plex Mono", monospace';
    ctx.fillText('Sample Size (n)', width / 2 - 35, height - 12);
    ctx.save();
    ctx.translate(15, height / 2 + 35);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Variance / Lower Bound', 0, 0);
    ctx.restore();

    // Plot CR Bound curve: Var >= sigma^2 / n over n in [10, 500]
    const maxN = 500;
    const maxVar = sigmaSq / 10; // Max variance at n = 10

    ctx.beginPath();
    ctx.strokeStyle = boundColor;
    ctx.lineWidth = 2.5;

    for (let i = 10; i <= maxN; i += 5) {
      const v = sigmaSq / i;
      const x = padding + ((i - 10) / (maxN - 10)) * graphW;
      const y = (height - padding) - (v / maxVar) * graphH;
      if (i === 10) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Highlight current selected n point
    const currentX = padding + ((n - 10) / (maxN - 10)) * graphW;
    const currentY = (height - padding) - (crBound / maxVar) * graphH;

    ctx.fillStyle = boundColor;
    ctx.beginPath();
    ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw Legend
    ctx.fillStyle = boundColor;
    ctx.fillRect(width - 170, padding, 12, 12);
    ctx.fillStyle = textColor;
    ctx.fillText('Cramér–Rao Bound (σ²/n)', width - 150, padding + 10);

    ctx.fillStyle = estColor;
    ctx.beginPath();
    ctx.arc(currentX, currentY - 8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = textColor;
    ctx.fillText('Sample Mean Var(θ̂)', width - 150, padding + 26);
  }

  nSlider.addEventListener('input', render);
  sigmaSlider.addEventListener('input', render);
  window.addEventListener('resize', render);
  window.addEventListener('themeChanged', render);
  render();
}

function initRegularizationSim() {
  const canvas = document.getElementById('reg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const lambdaSlider = document.getElementById('reg-lambda');
  const lambdaValDisplay = document.getElementById('reg-lambda-val');
  const ridgeCoeffDisplay = document.getElementById('ridge-b2');
  const lassoCoeffDisplay = document.getElementById('lasso-b2');

  function render() {
    const lambda = parseFloat(lambdaSlider.value);
    lambdaValDisplay.textContent = lambda.toFixed(1);

    // Initial unregularized coefficients (OLS)
    const beta1_ols = 3.5;
    const beta2_ols = 2.2;

    // Ridge shrinkage: beta_ridge = beta_ols / (1 + lambda * 0.4)
    const ridge_b1 = beta1_ols / (1 + lambda * 0.25);
    const ridge_b2 = beta2_ols / (1 + lambda * 0.25);

    // Lasso shrinkage (soft thresholding): max(0, |beta| - lambda * 0.3) * sign(beta)
    const lasso_b1 = Math.max(0, beta1_ols - lambda * 0.35);
    const lasso_b2 = Math.max(0, beta2_ols - lambda * 0.45);

    if (ridgeCoeffDisplay) ridgeCoeffDisplay.textContent = ridge_b2.toFixed(3);
    if (lassoCoeffDisplay) lassoCoeffDisplay.textContent = lasso_b2.toFixed(3);

    // Setup high DPI canvas scaling
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement.clientWidth || 600;
    const height = 240;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const isDark = document.body.classList.contains('dark-mode');
    const axisColor = isDark ? '#6B7280' : '#A0AEC0';
    const textColor = isDark ? '#E5E7EB' : '#1C1B19';
    const ridgeColor = isDark ? '#34D399' : '#059669'; // Emerald
    const lassoColor = isDark ? '#F59E0B' : '#D97706'; // Amber

    const padding = 45;
    const graphW = width - padding * 2;
    const graphH = height - padding * 2;

    // Draw Axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = textColor;
    ctx.font = '11px "IBM Plex Mono", monospace';
    ctx.fillText('Regularization Strength (λ)', width / 2 - 60, height - 12);
    ctx.save();
    ctx.translate(15, height / 2 + 45);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Coefficient Value (β₂)', 0, 0);
    ctx.restore();

    const maxLambda = 10;
    const maxBeta = 2.5;

    // Plot Ridge Path for Beta2
    ctx.beginPath();
    ctx.strokeStyle = ridgeColor;
    ctx.lineWidth = 2.5;
    for (let l = 0; l <= maxLambda; l += 0.2) {
      const r_b2 = beta2_ols / (1 + l * 0.25);
      const x = padding + (l / maxLambda) * graphW;
      const y = (height - padding) - (r_b2 / maxBeta) * graphH;
      if (l === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Plot Lasso Path for Beta2
    ctx.beginPath();
    ctx.strokeStyle = lassoColor;
    ctx.lineWidth = 2.5;
    for (let l = 0; l <= maxLambda; l += 0.2) {
      const l_b2 = Math.max(0, beta2_ols - l * 0.45);
      const x = padding + (l / maxLambda) * graphW;
      const y = (height - padding) - (l_b2 / maxBeta) * graphH;
      if (l === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Highlight current selected lambda point
    const currX = padding + (lambda / maxLambda) * graphW;
    const currRidgeY = (height - padding) - (ridge_b2 / maxBeta) * graphH;
    const currLassoY = (height - padding) - (lasso_b2 / maxBeta) * graphH;

    ctx.fillStyle = ridgeColor;
    ctx.beginPath();
    ctx.arc(currX, currRidgeY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = lassoColor;
    ctx.beginPath();
    ctx.arc(currX, currLassoY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Legend
    ctx.fillStyle = ridgeColor;
    ctx.fillRect(width - 180, padding, 12, 12);
    ctx.fillStyle = textColor;
    ctx.fillText('Ridge (L₂ Penalty)', width - 160, padding + 10);

    ctx.fillStyle = lassoColor;
    ctx.fillRect(width - 180, padding + 20, 12, 12);
    ctx.fillStyle = textColor;
    ctx.fillText('Lasso (L₁ Penalty - Sparse)', width - 160, padding + 30);
  }

  lambdaSlider.addEventListener('input', render);
  window.addEventListener('resize', render);
  window.addEventListener('themeChanged', render);
  render();
}
