export function downloadBlob(blob, name = 'file.txt') {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = name;

  document.body.appendChild(link);

  link.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  );

  document.body.removeChild(link);
}

export function saveAsPng(scatterplot) {
  const { pixels, width, height } = scatterplot.export();

  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;

  const ctx = c.getContext('2d');
  ctx.putImageData(new ImageData(pixels, width, height), 0, 0);

  // The following is only needed to flip the image vertically. Since `ctx.scale`
  // only affects `draw*()` calls and not `put*()` calls we have to draw the
  // image twice...
  const imageObject = new Image();
  imageObject.onload = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.scale(1, -1);
    ctx.drawImage(imageObject, 0, -height);
    c.toBlob((blob) => {
      downloadBlob(blob, 'scatter.png');
    });
  };
  imageObject.src = c.toDataURL();
}
