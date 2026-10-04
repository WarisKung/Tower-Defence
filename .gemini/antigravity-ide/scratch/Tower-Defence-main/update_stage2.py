from pathlib import Path

root = Path(r"C:\Users\TUF GAMING A15\.gemini\antigravity-ide\scratch\Tower-Defence-main")
p = root / "js" / "core" / "GameManager.js"
s = p.read_text(encoding="utf-8")

old = """    if (this.currentStageId === 'stage_1') {\n      this._renderStage1Backdrop(ctx);\n    }"""
new = """    if (this.currentStageId === 'stage_1') {\n      this._renderStage1Backdrop(ctx);\n    } else if (this.currentStageId === 'stage_2') {\n      this._renderStage2Backdrop(ctx);\n    }"""

if old not in s:
    raise SystemExit("stage backdrop hook not found")

s = s.replace(old, new, 1)

marker = "  _renderStage1Backdrop(ctx) {"
method = r'''  _renderStage2Backdrop(ctx) {
    // Stage 2: Enchanted Forest & Water — decorative background only.
    // Gameplay remains controlled by the Stage 2 grid/path data.
    const bg = ctx.createLinearGradient(0, 0, 0, this.gameHeight);
    bg.addColorStop(0, '#071f25');
    bg.addColorStop(0.42, '#0b3a31');
    bg.addColorStop(1, '#06251f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);

    // Deep forest layers.
    ctx.fillStyle = 'rgba(3, 30, 28, 0.88)';
    ctx.beginPath();
    ctx.moveTo(0, 170);
    for (let x = 0; x <= this.gameWidth; x += 80) {
      const y = 120 + ((x * 17) % 95);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(this.gameWidth, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Magical river running through the map background.
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(34, 211, 238, 0.42)';
    ctx.shadowBlur = 26;
    ctx.strokeStyle = 'rgba(14, 116, 144, 0.58)';
    ctx.lineWidth = 72;
    ctx.beginPath();
    ctx.moveTo(1040, -40);
    ctx.bezierCurveTo(980, 105, 1030, 180, 900, 255);
    ctx.bezierCurveTo(790, 320, 875, 405, 720, 485);
    ctx.bezierCurveTo(600, 550, 690, 635, 610, 760);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(68, 230, 255, 0.34)';
    ctx.lineWidth = 30;
    ctx.beginPath();
    ctx.moveTo(1040, -40);
    ctx.bezierCurveTo(980, 105, 1030, 180, 900, 255);
    ctx.bezierCurveTo(790, 320, 875, 405, 720, 485);
    ctx.bezierCurveTo(600, 550, 690, 635, 610, 760);
    ctx.stroke();

    // Waterfall pools / magical water lights.
    const pools = [
      [1030, 75, 70],
      [790, 340, 58],
      [650, 575, 76],
      [610, 705, 55]
    ];
    for (const [x, y, radius] of pools) {
      const glow = ctx.createRadialGradient(x, y, 2, x, y, radius);
      glow.addColorStop(0, 'rgba(103, 232, 249, 0.28)');
      glow.addColorStop(0.55, 'rgba(34, 211, 238, 0.10)');
      glow.addColorStop(1, 'rgba(34, 211, 238, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Soft mist between forest layers.
    const mist = ctx.createLinearGradient(0, 260, 0, 600);
    mist.addColorStop(0, 'rgba(125, 211, 252, 0.02)');
    mist.addColorStop(0.5, 'rgba(167, 243, 208, 0.08)');
    mist.addColorStop(1, 'rgba(125, 211, 252, 0.02)');
    ctx.fillStyle = mist;
    ctx.fillRect(0, 170, this.gameWidth, 450);

    // Magical fireflies and water particles.
    for (let i = 0; i < 55; i++) {
      const x = (i * 83) % this.gameWidth;
      const y = 45 + ((i * 47) % 610);
      const r = i % 7 === 0 ? 2.4 : 1.2;
      ctx.fillStyle = i % 3 === 0
        ? 'rgba(110, 231, 183, 0.72)'
        : 'rgba(103, 232, 249, 0.56)';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Vignette keeps the grid and UI readable.
    const vignette = ctx.createRadialGradient(
      this.gameWidth / 2,
      this.gameHeight / 2,
      250,
      this.gameWidth / 2,
      this.gameHeight / 2,
      800
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 20, 18, 0.48)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
  }

'''

if marker not in s:
    raise SystemExit("stage1 method marker not found")

s = s.replace(marker, method + marker, 1)
p.write_text(s, encoding="utf-8")
print("GameManager.js updated")
