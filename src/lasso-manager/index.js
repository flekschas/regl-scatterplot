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
  DEFAULT_LASSO_START_INITIATOR_SHOW,
  DEFAULT_LASSO_MIN_DELAY,
  DEFAULT_LASSO_MIN_DIST,
  LASSO_SHOW_START_INITIATOR_TIME,
  LASSO_HIDE_START_INITIATOR_TIME,
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

const inAnimation = `${LASSO_SHOW_START_INITIATOR_TIME}ms ease scaleInFadeOut 0s 1 normal backwards`;

const createInAnimationRule = (opacity, scale, rotate) => `
@keyframes scaleInFadeOut {
  0% {
    opacity: ${opacity};
    transform: translate(-50%,-50%) scale(${scale}) rotate(${rotate}deg);
  }
  10% {
    opacity: 1;
    transform: translate(-50%,-50%) scale(1) rotate(${rotate + 20}deg);
  }
  100% {
    opacity: 0;
    transform: translate(-50%,-50%) scale(0.9) rotate(${rotate + 60}deg);
  }
}
`;
let inAnimationRuleIndex = null;

const outAnimation = `${LASSO_HIDE_START_INITIATOR_TIME}ms ease fadeScaleOut 0s 1 normal backwards`;

const createOutAnimationRule = (opacity, scale, rotate) => `
@keyframes fadeScaleOut {
  0% {
    opacity: ${opacity};
    transform: translate(-50%,-50%) scale(${scale}) rotate(${rotate}deg);
  }
  100% {
    opacity: 0;
    transform: translate(-50%,-50%) scale(0) rotate(${rotate}deg);
  }
}
`;
let outAnimationRuleIndex = null;

export const createLasso = (
  element,
  {
    onDraw: initialOnDraw = identity,
    onStart: initialOnStart = identity,
    onEnd: initialOnEnd = identity,
    enableInitiator:
      initialenableInitiator = DEFAULT_LASSO_START_INITIATOR_SHOW,
    initiatorParentElement: initialinitiatorParentElement = document.body,
    minDelay: initialMinDelay = DEFAULT_LASSO_MIN_DELAY,
    minDist: initialMinDist = DEFAULT_LASSO_MIN_DIST,
    pointNorm: initialPointNorm = identity,
  } = {}
) => {
  let enableInitiator = initialenableInitiator;
  let initiatorParentElement = initialinitiatorParentElement;

  let onDraw = initialOnDraw;
  let onStart = initialOnStart;
  let onEnd = initialOnEnd;

  let minDelay = initialMinDelay;
  let minDist = initialMinDist;

  let pointNorm = initialPointNorm;

  const initiator = document.createElement('div');
  const id =
    Math.random().toString(36).substring(2, 5) +
    Math.random().toString(36).substring(2, 5);
  initiator.id = `lasso-initiator-${id}`;
  initiator.style.position = 'fixed';
  initiator.style.display = 'flex';
  initiator.style.justifyContent = 'center';
  initiator.style.alignItems = 'center';
  initiator.style.zIndex = 99;
  initiator.style.width = '4rem';
  initiator.style.height = '4rem';
  initiator.style.borderRadius = '4rem';
  initiator.style.opacity = 0.5;
  initiator.style.transform = 'translate(-50%,-50%) scale(0) rotate(0deg)';

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

    return [event.clientX - left, event.clientY - top];
  };

  window.addEventListener('mouseup', mouseUpHandler);

  const resetinitiatorStyle = () => {
    initiator.style.opacity = 0.5;
    initiator.style.transform = 'translate(-50%,-50%) scale(0) rotate(0deg)';
  };

  const getCurrentinitiatorAnimationStyle = () => {
    const computedStyle = getComputedStyle(initiator);
    const opacity = +computedStyle.opacity;
    // The css rule `transform: translate(-1, -1) scale(0.5);` is represented as
    // `matrix(0.5, 0, 0, 0.5, -1, -1)`
    const m = computedStyle.transform.match(/([0-9.-]+)+/g);

    const a = +m[0];
    const b = +m[1];

    const scale = Math.sqrt(a * a + b * b);
    const rotate = Math.atan2(b, a) * (180 / Math.PI);

    return { opacity, scale, rotate };
  };

  const showInitiator = (event) => {
    if (!enableInitiator) return;

    wait(0).then(() => {
      const x = event.clientX;
      const y = event.clientY;

      if (isMouseDown) return;

      let opacity = 0.5;
      let scale = 0;
      let rotate = 0;

      const style = getCurrentinitiatorAnimationStyle();
      opacity = style.opacity;
      scale = style.scale;
      rotate = style.rotate;
      initiator.style.opacity = opacity;
      initiator.style.transform = `translate(-50%,-50%) scale(${scale}) rotate(${rotate}deg)`;

      initiator.style.animation = 'none';

      // See https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Tips
      // why we need to wait for two animation frames
      nextAnimationFrame(2).then(() => {
        initiator.style.top = `${y}px`;
        initiator.style.left = `${x}px`;

        if (inAnimationRuleIndex !== null) removeRule(inAnimationRuleIndex);

        inAnimationRuleIndex = addRule(
          createInAnimationRule(opacity, scale, rotate)
        );

        initiator.style.animation = inAnimation;

        nextAnimationFrame().then(() => {
          resetinitiatorStyle();
        });
      });
    });
  };

  const hideInitiator = () => {
    const { opacity, scale, rotate } = getCurrentinitiatorAnimationStyle();
    initiator.style.opacity = opacity;
    initiator.style.transform = `translate(-50%,-50%) scale(${scale}) rotate(${rotate}deg)`;

    initiator.style.animation = 'none';

    nextAnimationFrame(2).then(() => {
      if (outAnimationRuleIndex !== null) removeRule(outAnimationRuleIndex);

      outAnimationRuleIndex = addRule(
        createOutAnimationRule(opacity, scale, rotate)
      );

      initiator.style.animation = outAnimation;

      nextAnimationFrame().then(() => {
        resetinitiatorStyle();
      });
    });
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

  const initiatorClickHandler = (event) => {
    showInitiator(event);
  };

  const initiatorMouseDownHandler = () => {
    isMouseDown = true;
    isLasso = true;
    clear();
    onStart();
  };

  const initiatorMouseLeaveHandler = () => {
    hideInitiator();
  };

  const end = ({ merge = false } = {}) => {
    isLasso = false;

    const currLassoPos = [...lassoPos];
    const currLassoPosFlat = [...lassoPosFlat];

    extendDb.cancel();

    clear();

    // When `currLassoPos` is empty the user didn't actually lasso
    if (currLassoPos.length) onEnd(currLassoPos, currLassoPosFlat, { merge });

    return currLassoPos;
  };

  const set = ({
    onDraw: newOnDraw = null,
    onStart: newOnStart = null,
    onEnd: newOnEnd = null,
    enableInitiator: newEnableInitiator = null,
    initiatorParentElement: newInitiatorParentElement = null,
    minDelay: newMinDelay = null,
    minDist: newMinDist = null,
    pointNorm: newPointNorm = null,
  } = {}) => {
    onDraw = ifNotNull(newOnDraw, onDraw);
    onStart = ifNotNull(newOnStart, onStart);
    onEnd = ifNotNull(newOnEnd, onEnd);
    enableInitiator = ifNotNull(newEnableInitiator, enableInitiator);
    minDelay = ifNotNull(newMinDelay, minDelay);
    minDist = ifNotNull(newMinDist, minDist);
    pointNorm = ifNotNull(newPointNorm, pointNorm);

    if (
      newInitiatorParentElement !== null &&
      newInitiatorParentElement !== initiatorParentElement
    ) {
      initiatorParentElement.removeChild(initiator);
      newInitiatorParentElement.appendChild(initiator);
      initiatorParentElement = newInitiatorParentElement;
    }

    if (enableInitiator) {
      initiator.addEventListener('click', initiatorClickHandler);
      initiator.addEventListener('mousedown', initiatorMouseDownHandler);
      initiator.addEventListener('mouseleave', initiatorMouseLeaveHandler);
    } else {
      initiator.removeEventListener('mousedown', initiatorMouseDownHandler);
      initiator.removeEventListener('mouseleave', initiatorMouseLeaveHandler);
    }
  };

  const destroy = () => {
    initiatorParentElement.removeChild(initiator);
    window.removeEventListener('mouseup', mouseUpHandler);
    initiator.removeEventListener('click', initiatorClickHandler);
    initiator.removeEventListener('mousedown', initiatorMouseDownHandler);
    initiator.removeEventListener('mouseleave', initiatorMouseLeaveHandler);
  };

  const withPublicMethods = () => (self) =>
    assign(self, {
      clear,
      destroy,
      end,
      extend: extendPublic,
      set,
      showInitiator,
      hideInitiator,
    });

  initiatorParentElement.appendChild(initiator);

  set({
    onDraw,
    onStart,
    onEnd,
    enableInitiator,
    initiatorParentElement,
  });

  return pipe(
    withStaticProperty('initiator', initiator),
    withPublicMethods(),
    withConstructor(createLasso)
  )({});
};

export default createLasso;
