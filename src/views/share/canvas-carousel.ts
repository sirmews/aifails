export const CANVAS_CAROUSEL_SCRIPT = `
  function renderCarouselSlide(targetCanvas, slideNum) {
    var ctx = targetCanvas.getContext('2d');
    if (!ctx) return;

    var scale = targetCanvas.width ? targetCanvas.width / 1080 : 1;
    ctx.save();
    if (scale !== 1) {
      ctx.scale(scale, scale);
    }
    ctx.imageSmoothingEnabled = true;

    var S = 1080;
    // 1. Canvas Background
    ctx.fillStyle = '#152435';
    ctx.fillRect(0, 0, S, S);

    // 2. Card Container
    var pad = 44;
    var cardW = S - pad * 2;
    var cardH = S - pad * 2;
    var cardX = pad;
    var cardY = pad;

    // Drop Shadow
    ctx.fillStyle = '#0e1a26';
    roundRect(ctx, cardX + 10, cardY + 10, cardW, cardH, 24);
    ctx.fill();

    // Card Surface
    ctx.fillStyle = '#2a4766';
    roundRect(ctx, cardX, cardY, cardW, cardH, 24);
    ctx.fill();

    // Outer Border
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 5;
    ctx.stroke();

    // 3. Top Header Bar
    var headerY = cardY + 46;

    // Keycap Logo
    ctx.fillStyle = '#0e1a26';
    roundRect(ctx, cardX + 36 + 4, headerY - 18 + 4, 120, 44, 8);
    ctx.fill();
    ctx.fillStyle = '#fed41d';
    roundRect(ctx, cardX + 36, headerY - 18, 120, 44, 8);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.font = '900 20px ui-monospace, Menlo, Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('(╯°□°)╯', cardX + 36 + 60, headerY + 4);

    // Brand Title
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Prompt Confessional', cardX + 172, headerY + 6);

    ctx.fillStyle = '#97bede';
    ctx.font = '700 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('a safe space for AI frustration', cardX + 172, headerY + 28);

    // Slide Badge (Top Right)
    var slideBadgeText = 'Slide ' + slideNum + ' / 3';
    ctx.font = '900 18px ui-monospace, Menlo, monospace';
    var slideBadgeW = ctx.measureText(slideBadgeText).width + 32;
    var slideBadgeX = cardX + cardW - 36 - slideBadgeW;

    ctx.fillStyle = '#0e1a26';
    roundRect(ctx, slideBadgeX + 3, headerY - 18 + 3, slideBadgeW, 44, 8);
    ctx.fill();
    ctx.fillStyle = '#fed41d';
    roundRect(ctx, slideBadgeX, headerY - 18, slideBadgeW, 44, 8);
    ctx.fill();
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(slideBadgeText, slideBadgeX + slideBadgeW / 2, headerY + 4);

    // Header Divider
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cardX + 36, headerY + 42);
    ctx.lineTo(cardX + cardW - 36, headerY + 42);
    ctx.stroke();

    // 4. Slide Content
    var contentX = cardX + 36;
    var contentY = headerY + 64;
    var contentW = cardW - 72;
    var contentH = 680;

    if (slideNum === 1) {
      // --- SLIDE 1: PROMPT ---
      ctx.fillStyle = '#1b2f44';
      roundRect(ctx, contentX, contentY, contentW, contentH, 16);
      ctx.fill();
      ctx.strokeStyle = '#0e1a26';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Left Blue Accent
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(contentX, contentY, 10, contentH);

      // Section Tag
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#97bede';
      ctx.font = '900 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('WHAT I ASKED FOR', contentX + 36, contentY + 44);

      // Prompt Body
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      var pLines = wrapText(ctx, cardData.prompt, contentW - 72, 9);
      for (var l = 0; l < pLines.length; l++) {
        ctx.fillText(pLines[l], contentX + 36, contentY + 104 + l * 54);
      }

      // Swipe Cue
      var swipeY = contentY + contentH - 40;
      ctx.textAlign = 'right';
      ctx.fillStyle = '#60a5fa';
      ctx.font = '900 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Swipe to see what happened ➔', contentX + contentW - 36, swipeY);
    } else if (slideNum === 2) {
      // --- SLIDE 2: THE FAILURE ---
      ctx.fillStyle = '#13202e';
      roundRect(ctx, contentX, contentY, contentW, contentH, 16);
      ctx.fill();
      ctx.strokeStyle = '#0e1a26';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Left Red Danger Accent
      ctx.fillStyle = '#f87171';
      ctx.fillRect(contentX, contentY, 10, contentH);

      // Section Tag
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f87171';
      ctx.font = '900 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('WHAT IT DID INSTEAD', contentX + 36, contentY + 44);

      // Terminal Dots
      drawTerminalDots(ctx, contentX + contentW - 80, contentY + 34);

      // Failure Body
      var cleanF = cardData.fail.split('\\\\n').filter(function(l) { return l.indexOf(b3) === -1; }).join(' ');
      var isCode = cardData.fail.indexOf(b3) !== -1;
      ctx.fillStyle = '#f1f5f9';

      if (isCode) {
        ctx.font = '600 30px ui-monospace, Menlo, Consolas, monospace';
        var fLines = wrapText(ctx, cleanF, contentW - 72, 10);
        for (var m = 0; m < fLines.length; m++) {
          ctx.fillText(fLines[m], contentX + 36, contentY + 104 + m * 44);
        }
      } else {
        ctx.font = '600 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        var fLines = wrapText(ctx, cleanF, contentW - 72, 9);
        for (var m = 0; m < fLines.length; m++) {
          ctx.fillText(fLines[m], contentX + 36, contentY + 106 + m * 50);
        }
      }

      // Swipe Cue
      var swipeY = contentY + contentH - 40;
      ctx.textAlign = 'right';
      ctx.fillStyle = '#f87171';
      ctx.font = '900 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Swipe for the reaction ➔', contentX + contentW - 36, swipeY);

    } else if (slideNum === 3) {
      // --- SLIDE 3: REACTION & CTA ---
      var upperH = 400;
      ctx.fillStyle = '#1e334a';
      roundRect(ctx, contentX, contentY, contentW, upperH, 16);
      ctx.fill();
      ctx.strokeStyle = '#0e1a26';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Left Amber Accent
      ctx.fillStyle = '#fed41d';
      ctx.fillRect(contentX, contentY, 10, upperH);

      // Section Tag
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#fed41d';
      ctx.font = '900 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('HOW IT MADE ME FEEL  ' + cardData.mood, contentX + 36, contentY + 44);

      // Feeling Quote
      ctx.fillStyle = '#fed41d';
      ctx.font = '700 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      var feelL = wrapText(ctx, cardData.feeling, contentW - 72, 4);
      for (var n = 0; n < feelL.length; n++) {
        ctx.fillText(feelL[n], contentX + 36, contentY + 104 + n * 52);
      }

      // Model Attribution
      ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#97bede';
      ctx.fillText('Model: ' + cardData.model, contentX + 36, contentY + upperH - 32);

      // Lower CTA Box
      var ctaY = contentY + upperH + 20;
      var ctaH = contentH - upperH - 20;
      ctx.fillStyle = '#152435';
      roundRect(ctx, contentX, ctaY, contentW, ctaH, 16);
      ctx.fill();
      ctx.strokeStyle = '#0e1a26';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Have an AI fail of your own?', contentX + contentW / 2, ctaY + 64);

      ctx.fillStyle = '#97bede';
      ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Confess anonymously or vote solidarity:', contentX + contentW / 2, ctaY + 110);

      // URL Highlight Box
      ctx.fillStyle = '#fed41d';
      ctx.font = '900 32px ui-monospace, Menlo, monospace';
      ctx.fillText('https://aifails.wtf', contentX + contentW / 2, ctaY + 172);
    }

    // 5. Footer Watermark Bar
    var footY = cardY + cardH - 28;
    ctx.strokeStyle = '#0e1a26';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cardX + 36, footY - 24);
    ctx.lineTo(cardX + cardW - 36, footY - 24);
    ctx.stroke();

    ctx.fillStyle = '#97bede';
    ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Anonymous AI Prompt Fails • aifails.wtf', cardX + 36, footY);

    ctx.fillStyle = '#fed41d';
    ctx.font = '900 18px ui-monospace, Menlo, monospace';
    ctx.textAlign = 'right';
    ctx.fillText('Confession #' + cardData.id.slice(0, 8), cardX + cardW - 36, footY);
    ctx.restore();
  }
`;
