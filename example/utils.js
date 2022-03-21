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
  const imageObject = new Image();
  imageObject.onload = () => {
    scatterplot.get('canvas').toBlob((blob) => {
      downloadBlob(blob, 'scatter.png');
    });
  };
  imageObject.src = scatterplot.get('canvas').toDataURL();
}
