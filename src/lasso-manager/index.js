import '@babel/polyfill';
import {
  assign,
  identity,
  l2PointDist,
  nextAnimationFrame,
  pipe,
  throttleAndDebounce,
  wait,
  withConstructor,
  withStaticProperty,
} from '@flekschas/utils';

import {
  DEFAULT_LASSO_START_INDICATOR_SHOW,
  DEFAULT_LASSO_START_INDICATOR_COLOR,
  DEFAULT_LASSO_MIN_DELAY,
  DEFAULT_LASSO_MIN_DIST,
  LASSO_SHOW_START_INDICATOR_TIME,
  LASSO_HIDE_START_INDICATOR_TIME,
} from './constants';

const ifNotNull = (v, alternative = null) => (v === null ? alternative : v);

const lassoStyleEl = document.createElement('style');
document.head.appendChild(lassoStyleEl);

const lassoStylesheets = lassoStyleEl.sheet;

const addRule = (rule) => {
  const currentNumRules = lassoStylesheets.rules.length;
  lassoStylesheets.insertRule(rule, currentNumRules);
  return currentNumRules;
};

const removeRule = (index) => {
  lassoStylesheets.deleteRule(index);
};

const inAnimation = `${LASSO_SHOW_START_INDICATOR_TIME}ms ease scaleInFadeOut 0s 1 normal backwards`;

const createInAnimationRule = (currentOpacity, currentScale) => `
@keyframes scaleInFadeOut {
  0% {
    opacity: ${currentOpacity};
    transform: translate(-50%,-50%) scale(${currentScale});
  }
  10% {
    opacity: 1;
    transform: translate(-50%,-50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%,-50%) scale(0.9);
  }
}
`;
let inAnimationRuleIndex = null;

const outAnimation = `${LASSO_HIDE_START_INDICATOR_TIME}ms ease fadeScaleOut 0s 1 normal backwards`;

const createOutAnimationRule = (currentOpacity, currentScale) => `
@keyframes fadeScaleOut {
  0% {
    opacity: ${currentOpacity};
    transform: translate(-50%,-50%) scale(${currentScale});
  }
  100% {
    opacity: 0;
    transform: translate(-50%,-50%) scale(0);
  }
}
`;
let outAnimationRuleIndex = null;

const createLasso = (
  element,
  {
    onDraw: initialOnDraw = identity,
    onStart: initialOnStart = identity,
    onEnd: initialOnEnd = identity,
    startIndicatorShow: initialStartIndicatorShow = DEFAULT_LASSO_START_INDICATOR_SHOW,
    startIndicatorColor: initialStartIndicatorColor = DEFAULT_LASSO_START_INDICATOR_COLOR,
    minDelay: initialMinDelay = DEFAULT_LASSO_MIN_DELAY,
    minDist: initialMinDist = DEFAULT_LASSO_MIN_DIST,
    pointNorm: initialPointNorm = identity,
  } = {}
) => {
  let startIndicatorShow = initialStartIndicatorShow;
  let startIndicatorColor = initialStartIndicatorColor;

  let onDraw = initialOnDraw;
  let onStart = initialOnStart;
  let onEnd = initialOnEnd;

  let minDelay = initialMinDelay;
  let minDist = initialMinDist;

  let pointNorm = initialPointNorm;

  const startIndicator = document.createElement('div');
  const id =
    Math.random().toString(36).substring(2, 5) +
    Math.random().toString(36).substring(2, 5);
  startIndicator.id = `lasso-start-indicator-${id}`;
  startIndicator.style.position = 'absolute';
  startIndicator.style.display = 'flex';
  startIndicator.style.justifyContent = 'center';
  startIndicator.style.alignItems = 'center';
  startIndicator.style.zIndex = 99;
  startIndicator.style.width = '4rem';
  startIndicator.style.height = '4rem';
  startIndicator.style.borderRadius = '4rem';
  startIndicator.style.fontSize = '8px';
  startIndicator.style.color = 'white';
  startIndicator.style.textTransform = 'uppercase';
  startIndicator.style.opacity = 0.5;
  startIndicator.style.transform = 'translate(-50%,-50%) scale(0)';

  const startIndicatorText = document.createElement('span');
  startIndicatorText.innerHTML = 'Drag<br/>To Lasso';
  startIndicatorText.style.userSelect = 'none';
  startIndicatorText.style.textAlign = 'center';
  startIndicatorText.style.pointerEvents = 'none';
  startIndicator.appendChild(startIndicatorText);

  let isMouseDown = false;
  let isLasso = false;
  let lassoPos = [];
  let lassoPosFlat = [];
  let lassoPrevMousePos;

  const mouseUpHandler = () => {
    isMouseDown = false;
  };

  const getMousePosition = (event) => {
    const { left, top } = element.getBoundingClientRect();

    return [
      event.clientX - left + window.scrollX,
      event.clientY - top + window.scrollY,
    ];
  };

  window.addEventListener('mouseup', mouseUpHandler);

  const resetStartIndicatorStyle = () => {
    startIndicator.style.opacity = 0.5;
    startIndicator.style.transform = 'translate(-50%,-50%) scale(0)';
  };

  const getCurrentStartIndicatorAnimationStyle = () => {
    const computedStyle = getComputedStyle(startIndicator);
    const opacity = +computedStyle.opacity;
    // The css rule `transform: translate(-1, -1) scale(0.5);` is represented as
    // `matrix(0.5, 0, 0, 0.5, -1, -1)`
    const m = computedStyle.transform.match(/([0-9.-]+)+/g);
    const scale = m ? +m[0] : 1;

    return { opacity, scale };
  };

  const showStartIndicator = async (event) => {
    if (!startIndicatorShow) return;

    await wait(0);

    const x = event.clientX;
    const y = event.clientY;

    if (isMouseDown) return;

    let opacity = 0.5;
    let scale = 0;

    const style = getCurrentStartIndicatorAnimationStyle();
    opacity = style.opacity;
    scale = style.scale;
    startIndicator.style.opacity = opacity;
    startIndicator.style.transform = `translate(-50%,-50%) scale(${scale})`;

    startIndicator.style.animation = 'none';

    // See https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Tips
    // why we need to wait for two animation frames
    await nextAnimationFrame(2);

    startIndicator.style.top = `${y}px`;
    startIndicator.style.left = `${x}px`;

    if (inAnimationRuleIndex !== null) removeRule(inAnimationRuleIndex);

    inAnimationRuleIndex = addRule(createInAnimationRule(opacity, scale));

    startIndicator.style.animation = inAnimation;

    await nextAnimationFrame();
    resetStartIndicatorStyle();
  };

  const hideStartIndicator = async () => {
    const { opacity, scale } = getCurrentStartIndicatorAnimationStyle();
    startIndicator.style.opacity = opacity;
    startIndicator.style.transform = `translate(-50%,-50%) scale(${scale})`;

    startIndicator.style.animation = 'none';

    await nextAnimationFrame(2);

    if (outAnimationRuleIndex !== null) removeRule(outAnimationRuleIndex);

    outAnimationRuleIndex = addRule(createOutAnimationRule(opacity, scale));

    startIndicator.style.animation = outAnimation;

    await nextAnimationFrame();
    resetStartIndicatorStyle();
  };

  const draw = () => {
    onDraw(lassoPos, lassoPosFlat);
  };

  const extend = (currMousePos) => {
    if (!lassoPrevMousePos) {
      if (!isLasso) {
        isLasso = true;
        onStart();
      }
      lassoPrevMousePos = currMousePos;
      const point = pointNorm(currMousePos);
      lassoPos = [point];
      lassoPosFlat = [point[0], point[1]];
    } else {
      const d = l2PointDist(
        currMousePos[0],
        currMousePos[1],
        lassoPrevMousePos[0],
        lassoPrevMousePos[1]
      );

      if (d > DEFAULT_LASSO_MIN_DIST) {
        lassoPrevMousePos = currMousePos;
        const point = pointNorm(currMousePos);
        lassoPos.push(point);
        lassoPosFlat.push(point[0], point[1]);
        if (lassoPos.length > 1) {
          draw();
        }
      }
    }
  };

  const extendDb = throttleAndDebounce(
    extend,
    DEFAULT_LASSO_MIN_DELAY,
    DEFAULT_LASSO_MIN_DELAY
  );

  const extendPublic = (event, debounced) => {
    const mousePosition = getMousePosition(event);
    if (debounced) return extendDb(mousePosition);
    return extend(mousePosition);
  };

  const clear = () => {
    lassoPos = [];
    lassoPosFlat = [];
    lassoPrevMousePos = undefined;
    draw();
  };

  const indicatorClickHandler = (event) => {
    showStartIndicator(event);
  };

  const indicatorMouseDownHandler = () => {
    isMouseDown = true;
    isLasso = true;
    clear();
    onStart();
  };

  const indicatorMouseLeaveHandler = () => {
    hideStartIndicator();
  };

  const end = () => {
    isLasso = false;

    const currLassoPos = [...lassoPos];
    const currLassoPosFlat = [...lassoPosFlat];

    extendDb.cancel();

    clear();

    onEnd(currLassoPos, currLassoPosFlat);

    return currLassoPos;
  };

  const set = ({
    onDraw: newOnDraw = null,
    onStart: newOnStart = null,
    onEnd: newOnEnd = null,
    startIndicator: sowStartIndicatorShow = null,
    startIndicatorColor: newStartIndicatorColor = null,
    minDelay: newMinDelay = null,
    minDist: newMinDist = null,
    pointNorm: newPointNorm = null,
  } = {}) => {
    onDraw = ifNotNull(newOnDraw, onDraw);
    onStart = ifNotNull(newOnStart, onStart);
    onEnd = ifNotNull(newOnEnd, onEnd);
    startIndicatorShow = ifNotNull(sowStartIndicatorShow, startIndicatorShow);
    startIndicatorColor = ifNotNull(
      newStartIndicatorColor,
      startIndicatorColor
    );
    minDelay = ifNotNull(newMinDelay, minDelay);
    minDist = ifNotNull(newMinDist, minDist);
    pointNorm = ifNotNull(newPointNorm, pointNorm);

    startIndicator.style.background = startIndicatorColor;

    if (startIndicatorShow) {
      startIndicator.addEventListener('click', indicatorClickHandler);
      startIndicator.addEventListener('mousedown', indicatorMouseDownHandler);
      startIndicator.addEventListener('mouseleave', indicatorMouseLeaveHandler);
    } else {
      startIndicator.removeEventListener(
        'mousedown',
        indicatorMouseDownHandler
      );
      startIndicator.removeEventListener(
        'mouseleave',
        indicatorMouseLeaveHandler
      );
    }
  };

  const destroy = () => {
    document.body.removeChild(startIndicator);
    window.removeEventListener('mouseup', mouseUpHandler);
    startIndicator.removeEventListener('click', indicatorClickHandler);
    startIndicator.removeEventListener('mousedown', indicatorMouseDownHandler);
    startIndicator.removeEventListener(
      'mouseleave',
      indicatorMouseLeaveHandler
    );
  };

  const withPublicMethods = () => (self) =>
    assign(self, {
      clear,
      destroy,
      end,
      extend: extendPublic,
      set,
      showStartIndicator,
    });

  set({
    onDraw,
    onStart,
    onEnd,
    startIndicatorShow,
    startIndicatorColor,
  });

  document.body.appendChild(startIndicator);

  return pipe(
    withStaticProperty('startIndicator', startIndicator),
    withPublicMethods(),
    withConstructor(createLasso)
  )({});
};

export default createLasso;
