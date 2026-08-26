export const CANVAS_SINGLE_SCRIPT = `
  function renderSingleCard(targetCanvas) {
    var ctx = targetCanvas.getContext('2d');
    if (!ctx) return;

    var scale = targetCanvas.width ? targetCanvas.width / 1600 : 1;
    ctx.save();
    if (scale !== 1) {
      ctx.scale(scale, scale);
    }
    ctx.imageSmoothingEnabled = true;

    var W = 1600;
    var H = 900;

    // 1. Solid Marge Cobalt Canvas Background
    ctx.fillStyle = '#152435';
    ctx.fillRect(0, 0, W, H);

    // 2. Card Container
    var padX = 40;
    var padY = 36;
    var cardW = W - padX * 2;
    var cardH = H - padY * 2;
    var cardX = padX;
    var cardY = padY;

    // 3D Drop Shadow
    ctx.fillStyle = '#0e1a26';
    roundRect(ctx, cardX + 10, cardY + 10, cardW, cardH, 20);
    ctx.fill();

    // Card Surface
    ctx.fillStyle = '#2a4766';
    roundRect(ctx, cardX, cardY, cardW, cardH, 20);
    ctx.fill();

    // Card Outer Border
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 5;
    ctx.stroke();

    // 3. Top Header inside Card
    var headerY = cardY + 44;

    // Keycap Logo Shadow
    ctx.fillStyle = '#0e1a26';
    roundRect(ctx, cardX + 40 + 4, headerY - 20 + 4, 140, 48, 8);
    ctx.fill();

    // Keycap Logo Button (Bart Yellow)
    ctx.fillStyle = '#fed41d';
    roundRect(ctx, cardX + 40, headerY - 20, 140, 48, 8);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.font = '900 24px ui-monospace, Menlo, Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('(╯°□°)╯', cardX + 40 + 70, headerY + 4);

    // Brand Title & Subtitle
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Prompt Confessional', cardX + 200, headerY + 5);

    ctx.fillStyle = '#97bede';
    ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('a safe space for AI frustration', cardX + 200, headerY + 29);

    // Model Pill Badge (Top Right)
    ctx.font = '900 20px ui-monospace, Menlo, monospace';
    var modelBadge = cardData.model;
    var badgeW = ctx.measureText(modelBadge).width + 40;
    var badgeX = cardX + cardW - 40 - badgeW;

    // Badge Shadow
    ctx.fillStyle = '#0e1a26';
    roundRect(ctx, badgeX + 4, headerY - 18 + 4, badgeW, 46, 8);
    ctx.fill();

    // Badge Body (Bart Yellow)
    ctx.fillStyle = '#fed41d';
    roundRect(ctx, badgeX, headerY - 18, badgeW, 46, 8);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(modelBadge, badgeX + badgeW / 2, headerY + 5);

    // Header Divider
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cardX + 40, headerY + 44);
    ctx.lineTo(cardX + cardW - 40, headerY + 44);
    ctx.stroke();

    // 4. Content Area Layout
    var curY = headerY + 64;
    var innerW = cardW - 80;
    var contentX = cardX + 40;

    // SECTION 1: "WHAT I ASKED FOR"
    var promptSectionH = 165;
    ctx.fillStyle = '#1b2f44';
    roundRect(ctx, contentX, curY, innerW, promptSectionH, 10);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Left Blue Accent Bar
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(contentX, curY, 8, promptSectionH);

    // Section Header Tag
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#97bede';
    ctx.font = '900 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('WHAT I ASKED FOR', contentX + 28, curY + 32);

    // Prompt Text (Large & Legible)
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    var promptLines = wrapText(ctx, cardData.prompt, innerW - 60, 2);
    for (var i = 0; i < promptLines.length; i++) {
      ctx.fillText(promptLines[i], contentX + 28, curY + 74 + i * 42);
    }

    curY += promptSectionH + 16;

    // SECTION 2: "WHAT IT DID INSTEAD" (Terminal Danger Box)
    var failSectionH = 280;
    ctx.fillStyle = '#13202e';
    roundRect(ctx, contentX, curY, innerW, failSectionH, 10);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Left Danger Red Bar
    ctx.fillStyle = '#f87171';
    ctx.fillRect(contentX, curY, 8, failSectionH);

    // Section Header Tag
    ctx.fillStyle = '#f87171';
    ctx.font = '900 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('WHAT IT DID INSTEAD', contentX + 28, curY + 32);

    // Terminal Dots
    drawTerminalDots(ctx, contentX + innerW - 70, curY + 24);

    // Terminal Fail Content
    ctx.fillStyle = '#f1f5f9';
    var cleanFail = cardData.fail.split('\\\\n').filter(function(l) { return l.indexOf(b3) === -1; }).join(' ');
    var isCodeBlock = cardData.fail.indexOf(b3) !== -1;

    if (isCodeBlock) {
      ctx.font = '600 26px ui-monospace, Menlo, Consolas, monospace';
      var failLines = wrapText(ctx, cleanFail, innerW - 60, 5);
      for (var j = 0; j < failLines.length; j++) {
        ctx.fillText(failLines[j], contentX + 28, curY + 74 + j * 36);
      }
    } else {
      ctx.font = '600 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      var failLines = wrapText(ctx, cleanFail, innerW - 60, 4);
      for (var j = 0; j < failLines.length; j++) {
        ctx.fillText(failLines[j], contentX + 28, curY + 76 + j * 42);
      }
    }

    curY += failSectionH + 16;

    // SECTION 3: "HOW IT MADE ME FEEL" (Bart Yellow Banner)
    var feelSectionH = 135;
    ctx.fillStyle = '#1e334a';
    roundRect(ctx, contentX, curY, innerW, feelSectionH, 10);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Left Amber Bar
    ctx.fillStyle = '#fed41d';
    ctx.fillRect(contentX, curY, 8, feelSectionH);

    // Header Label
    ctx.fillStyle = '#fed41d';
    ctx.font = '900 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('HOW IT MADE THEM FEEL  ' + cardData.mood, contentX + 28, curY + 32);

    // Feeling Text
    ctx.fillStyle = '#fed41d';
    ctx.font = '700 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    var feelLines = wrapText(ctx, cardData.feeling, innerW - 60, 2);
    for (var k = 0; k < feelLines.length; k++) {
      ctx.fillText(feelLines[k], contentX + 28, curY + 74 + k * 42);
    }

    // 5. Footer Watermark Bar
    var footY = cardY + cardH - 26;
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cardX + 40, footY - 24);
    ctx.lineTo(cardX + cardW - 40, footY - 24);
    ctx.stroke();

    ctx.fillStyle = '#97bede';
    ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Anonymous AI Prompt Fails • aifails.wtf', cardX + 40, footY);

    ctx.fillStyle = '#fed41d';
    ctx.font = '900 22px ui-monospace, Menlo, monospace';
    ctx.textAlign = 'right';
    ctx.fillText('https://aifails.wtf', cardX + cardW - 40, footY);
    ctx.restore();
  }
`;
