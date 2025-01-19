import { Pane } from 'tweakpane';

import { LinkPlugin } from './tweakpane-link-plugin';
import { saveAsPng } from './utils';

const DEFAULT_PARAMS = {
  numPoints: 100000,
  pointSize: 2,
  opacity: 0.33,
  opacityByDensity: false,
  lassoInit: 'longPress',
  lassoType: 'freeform',
  lassoBrushSize: 24,
};

const set = (scatterplot, keyValuePairs) => {
  if (Array.isArray(scatterplot)) {
    for (const s of scatterplot) {
      s.set(keyValuePairs);
    }
  } else {
    scatterplot.set(keyValuePairs);
  }
}

export function createMenu({
  scatterplot,
  setNumPoints,
  setPointSize,
  setOpacity,
  opacityChangesDisabled,
}) {
  let init = false;

  const refScatterplot = Array.isArray(scatterplot)
    ? scatterplot[0]
    : scatterplot;

  const params = {
    ...DEFAULT_PARAMS,
    numPoints: 0,
    pointSize: Array.isArray(refScatterplot.get('pointSize'))
      ? refScatterplot.get('pointSize')[0]
      : refScatterplot.get('pointSize'),
    opacity: refScatterplot.get('opacity'),
    opacityByDensity: refScatterplot.get('opacityBy') === 'density',
    lassoType: refScatterplot.get('lassoType'),
    lassoBrushSize: refScatterplot.get('lassoBrushSize'),
  };
  const initialParams = { ...params };

  const pane = new Pane({
    title: 'Details',
    container: document.getElementById('controls'),
  });
  pane.registerPlugin({ id: 'link', plugins: [LinkPlugin] });

  const settings = pane.addFolder({ title: 'Settings' });

  const numPoints = settings.addBinding(
    params,
    'numPoints',
    { label: 'Num Points', min: 1000, step: 1000, max: 2000000 }
  );
  numPoints.disabled = true;
  if (setNumPoints) {
    numPoints.on('change', ({ last, value }) => {
      if (init && last) setNumPoints(value);
    });
  }

  const pointSize = settings.addBinding(
    params, 'pointSize', { label: 'Point Size', min: 1, max: 32, step: 1 }
  );
  pointSize.disabled = Array.isArray(refScatterplot.get('pointSize'));
  pointSize.on('change', ({ value }) => {
    if (setPointSize) {
      setPointSize(value);
    } else {
      set(scatterplot, { pointSize: value });
    }
  });

  const opacity = settings.addBinding(
    params,
    'opacity',
    { label: 'Opacity', min: 0.01, max: 1, step: 0.01 }
  );
  opacity.disabled = params.opacityByDensity || Boolean(opacityChangesDisabled);
  opacity.on('change', ({ value }) => {
    if (setOpacity) {
      setOpacity(value);
    } else {
      set(scatterplot, { opacity: value });
    }
  });

  const opacityByDensity = settings.addBinding(
    params,
    'opacityByDensity',
    { label: 'Dynamic Opacity' }
  );
  opacityByDensity.disabled = Boolean(opacityChangesDisabled);
  opacityByDensity.on('change', ({ value }) => {
    set(scatterplot, { opacityBy: value ? 'density' : null });
    opacity.disabled = value;
  });

  const lassoInit = settings.addBinding(
    params,
    'lassoInit',
    {
      label: 'Lasso Init',
      options: {
        'On Long Press': 'longPress',
        'Via Click Initiator': 'clickInitiator'
      }
    }
  );
  lassoInit.on('change', ({ value }) => {
    switch (value) {
      case 'longPress': {
        set(scatterplot, {
          lassoInitiator: false,
          lassoOnLongPress: true,
        });
        break;
      }
      case 'clickInitiator': {
        set(scatterplot, {
          lassoInitiator: true,
          lassoOnLongPress: false,
        });
        break;
      }
    }
  });

  const lassoType = settings.addBinding(
    params,
    'lassoType',
    {
      label: 'Lasso Type',
      options: {
        'Freeform': 'freeform',
        'Brush': 'brush',
        'Rectangle': 'rectangle',
      }
    }
  );
  lassoType.on('change', ({ value }) => {
    switch (value) {
      case 'freeform': {
        set(scatterplot, { lassoType: 'freeform' });
        break;
      }
      case 'brush': {
        set(scatterplot, { lassoType: 'brush' });
        break;
      }
      case 'rectangle': {
        set(scatterplot, { lassoType: 'rectangle' });
        break;
      }
    }
    lassoBrushSize.hidden = value !== 'brush';
  });

  const lassoBrushSize = settings.addBinding(
    params,
    'lassoBrushSize',
    { label: 'Brush Size', min: 1, max: 256, step: 1 }
  );
  lassoBrushSize.hidden = params.lassoType !== 'brush';
  lassoBrushSize.on('change', ({ value }) => {
    set(scatterplot, { lassoBrushSize: value });
  });

  const reset = settings.addButton({ title: 'Reset' });
  reset.on('click', () => {
    for (const [key, value] of Object.entries(initialParams)) {
      params[key] = value;
    }
    pane.refresh();
  })

  const examples = pane.addFolder({ title: 'Examples' });

  const pathname = window.location.pathname.slice(1);

  examples.addBlade({
    view: 'link',
    label: 'Color Encoding',
    link: 'index.html',
    active: pathname === '' || pathname === 'index.html',
  });

  examples.addBlade({
    view: 'link',
    label: 'Size & Opacity Encoding',
    link: 'size-encoding.html',
    active: pathname === 'size-encoding.html',
  });

  examples.addBlade({
    view: 'link',
    label: 'Dynamic Opacity',
    link: 'dynamic-opacity.html',
    active: pathname === 'dynamic-opacity.html',
  });

  examples.addBlade({
    view: 'link',
    label: 'Axes',
    link: 'axes.html',
    active: pathname === 'axes.html',
  });

  examples.addBlade({
    view: 'link',
    label: 'Text Labels',
    link: 'text-labels.html',
    active: pathname === 'text-labels.html',
  });

  examples.addBlade({
    view: 'link',
    label: 'Annotations',
    link: 'annotations.html',
    active: pathname === 'annotations.html',
  });

  examples.addBlade({
    view: 'link',
    label: 'Multiple Instances',
    link: 'multiple-instances.html',
    active: pathname === 'multiple-instances.html',
  });

  examples.addBlade({
    view: 'link',
    label: 'Transition',
    link: 'transition.html',
    active: pathname === 'transition.html',
  });

  examples.addBlade({
    view: 'link',
    label: 'Point Connections',
    link: 'connected-points.html',
    active: pathname === 'connected-points.html',
  });

  examples.addBlade({
    view: 'link',
    label: 'Point Connections by Line Segments',
    link: 'connected-points-by-segments.html',
    active: pathname === 'connected-points-by-segments.html',
  });

  examples.addBlade({
    view: 'link',
    label: 'Background Image',
    link: 'texture-background.html',
    active: pathname === 'texture-background.html',
  });

  examples.addBlade({
    view: 'link',
    label: 'Performance Mode (20M Points)',
    link: 'performance-mode.html',
    active: pathname === 'performance-mode.html',
  });

  const info = pane.addFolder({ title: 'Info', expanded: false });

  info.addBlade({
    view: 'text',
    label: 'version',
    parse: (v) => String(v),
    value: refScatterplot.get('version'),
    disabled: true,
  });

  const download = pane.addButton({ title: 'Download as PNG' });
  download.on('click', () => {
    saveAsPng(scatterplot);
  });

  const sourceCode = pane.addButton({ title: 'Source Code' });
  sourceCode.on('click', () => {
    window.open(
      'https://github.com/flekschas/regl-scatterplot', '_blank'
    ).focus();
  });

  refScatterplot.subscribe('draw', () => {
    params.numPoints = refScatterplot.get('points').length;
    initialParams.numPoints = params.numPoints;
    if (setNumPoints) numPoints.disabled = false;
    pane.refresh();
    init = true;
  }, 1);
}

export default createMenu;
