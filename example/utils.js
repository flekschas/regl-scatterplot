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
      downloadBlob(blob, 'regl-scatterplot.png');
    });
  };
  imageObject.src = scatterplot.get('canvas').toDataURL();
}

export function closeModal() {
  const modal = document.querySelector('#modal');
  const modalText = document.querySelector('#modal-text');
  modal.style.display = 'none';
  modalText.textContent = '';
}

export function showModal(text, isError, isClosable) {
  const modal = document.querySelector('#modal');
  modal.style.display = 'flex';

  const modalText = document.querySelector('#modal-text');
  modalText.style.color = isError ? '#cc79A7' : '#bbb';
  modalText.textContent = text;

  const modalClose = document.querySelector('#modal-close');
  if (isClosable) {
    modalClose.style.display = 'block';
    modalClose.style.background = isError ? '#cc79A7' : '#bbb';
    modalClose.addEventListener('click', closeModal, { once: true });
  } else {
    modalClose.style.display = 'none';
  }
}

export function checkSupport(scatterplot) {
  if (!scatterplot.isSupported) {
    showModal(
      'Your browser does not support all necessary WebGL features. The scatter plot might not render properly.',
      true,
      true
    );
  }
}
