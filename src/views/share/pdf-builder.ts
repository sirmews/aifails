// Client-side PDF generation routine for LinkedIn carousel documents (300 DPI Retina embed)
export const PDF_BUILDER_SCRIPT = `
  function buildCarouselPdf(jpegImages) {
    var encoder = new TextEncoder();
    var chunks = [];
    var offsets = [];
    var currentOffset = 0;

    function writeStr(str) {
      var b = encoder.encode(str);
      chunks.push(b);
      currentOffset += b.length;
    }

    function writeBytes(bytes) {
      chunks.push(bytes);
      currentOffset += bytes.length;
    }

    writeStr("%PDF-1.4\\n");
    writeBytes(new Uint8Array([0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A]));

    var numPages = jpegImages.length;
    var numObjects = 2 + numPages * 3;

    // Object 1: Catalog
    offsets[1] = currentOffset;
    writeStr("1 0 obj\\n<< /Type /Catalog /Pages 2 0 R >>\\nendobj\\n");

    // Object 2: Pages
    var pageRefs = [];
    for (var p = 0; p < numPages; p++) {
      pageRefs.push((3 + p * 3) + " 0 R");
    }
    offsets[2] = currentOffset;
    writeStr("2 0 obj\\n<< /Type /Pages /Kids [" + pageRefs.join(" ") + "] /Count " + numPages + " >>\\nendobj\\n");

    // Standard square presentation points (1080x1080 points)
    var pageWidth = 1080;
    var pageHeight = 1080;

    for (var i = 0; i < numPages; i++) {
      var img = jpegImages[i];
      var pageObjId = 3 + i * 3;
      var contentsObjId = 4 + i * 3;
      var imageObjId = 5 + i * 3;
      var imgName = "Im" + (i + 1);

      // Page Object (1080x1080 MediaBox)
      offsets[pageObjId] = currentOffset;
      writeStr(pageObjId + " 0 obj\\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + pageWidth + " " + pageHeight + "] /Resources << /XObject << /" + imgName + " " + imageObjId + " 0 R >> >> /Contents " + contentsObjId + " 0 R >>\\nendobj\\n");

      // Content Stream maps image to page
      var streamContent = "q\\n" + pageWidth + " 0 0 " + pageHeight + " 0 0 cm\\n/" + imgName + " Do\\nQ\\n";
      var streamBytes = encoder.encode(streamContent);
      offsets[contentsObjId] = currentOffset;
      writeStr(contentsObjId + " 0 obj\\n<< /Length " + streamBytes.length + " >>\\nstream\\n");
      writeBytes(streamBytes);
      writeStr("\\nendstream\\nendobj\\n");

      // Image XObject with full supersampled pixel dimensions (2160x2160)
      offsets[imageObjId] = currentOffset;
      writeStr(imageObjId + " 0 obj\\n<< /Type /XObject /Subtype /Image /Width " + img.width + " /Height " + img.height + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + img.bytes.length + " >>\\nstream\\n");
      writeBytes(img.bytes);
      writeStr("\\nendstream\\nendobj\\n");
    }

    // Cross-Reference Table
    var startXref = currentOffset;
    writeStr("xref\\n0 " + (numObjects + 1) + "\\n");
    writeStr("0000000000 65535 f \\n");
    for (var obj = 1; obj <= numObjects; obj++) {
      var offStr = String(offsets[obj]).padStart(10, "0");
      writeStr(offStr + " 00000 n \\n");
    }

    // Trailer
    writeStr("trailer\\n<< /Size " + (numObjects + 1) + " /Root 1 0 R >>\\nstartxref\\n" + startXref + "\\n%%EOF\\n");

    var totalLen = 0;
    for (var k = 0; k < chunks.length; k++) totalLen += chunks[k].length;
    var result = new Uint8Array(totalLen);
    var pos = 0;
    for (var m = 0; m < chunks.length; m++) {
      result.set(chunks[m], pos);
      pos += chunks[m].length;
    }
    return result;
  }

  function getSlideJpegBytes(slideNum) {
    var offCanvas = document.createElement('canvas');
    // 2x Retina supersampling (2160x2160) for razor-sharp vector-grade text in PDF viewers
    offCanvas.width = 2160;
    offCanvas.height = 2160;
    renderCarouselSlide(offCanvas, slideNum);
    return new Promise(function(resolve, reject) {
      offCanvas.toBlob(function(blob) {
        if (!blob) return reject(new Error('Canvas blob generation failed'));
        var reader = new FileReader();
        reader.onload = function() {
          resolve({
            bytes: new Uint8Array(reader.result),
            width: 2160,
            height: 2160
          });
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      }, 'image/jpeg', 0.98);
    });
  }
`;
