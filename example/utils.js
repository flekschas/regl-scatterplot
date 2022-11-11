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

export function showModal(text, isError) {
  const modal = document.querySelector('#modal');
  const modalText = document.querySelector('#modal span');
  modal.style.display = 'flex';
  modalText.style.color = isError ? '#cc79A7' : '#bbb';
  modalText.textContent = text;
}

export function closeModal() {
  const modal = document.querySelector('#modal');
  const modalText = document.querySelector('#modal span');
  modal.style.display = 'none';
  modalText.textContent = '';
}

export function checkSupport(scatterplot) {
  if (!scatterplot.isSupported) {
    showModal(
      'Unfortunately, your browser does not support all WebGL extensions required by regl-scatterplot',
      true
    );
  }
}
