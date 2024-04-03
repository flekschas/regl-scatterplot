import {
  assign,
  identity,
  l2PointDist,
  nextAnimationFrame,
  pipe,
  throttleAndDebounce,
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

import {
  DEFAULT_LASSO_LONG_PRESS_TIME,
  DEFAULT_LASSO_LONG_PRESS_AFTER_EFFECT_TIME,
  DEFAULT_LASSO_LONG_PRESS_EFFECT_DELAY,
  DEFAULT_LASSO_LONG_PRESS_REVERT_EFFECT_TIME,
} from '../constants';

import createLongPressElements from './create-long-press-elements';
import {
  createLongPressInAnimations,
  createLongPressOutAnimations,
} from './create-long-press-animations';

const ifNotNull = (v, alternative = null) => (v === null ? alternative : v);

let cachedLassoStylesheets;

const getLassoStylesheets = () => {
  if (!cachedLassoStylesheets) {
    const lassoStyleEl = document.createElement('style');
    document.head.appendChild(lassoStyleEl);
    cachedLassoStylesheets = lassoStyleEl.sheet;
  }
  return cachedLassoStylesheets;
};

const addRule = (rule) => {
  const lassoStylesheets = getLassoStylesheets();
  const currentNumRules = lassoStylesheets.rules.length;
  lassoStylesheets.insertRule(rule, currentNumRules);
  return currentNumRules;
};

const removeRule = (index) => {
  getLassoStylesheets().deleteRule(index);
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
    initiatorParentElement: initialInitiatorParentElement = document.body,
    longPressIndicatorParentElement:
      initialLongPressIndicatorParentElement = document.body,
    minDelay: initialMinDelay = DEFAULT_LASSO_MIN_DELAY,
    minDist: initialMinDist = DEFAULT_LASSO_MIN_DIST,
    pointNorm: initialPointNorm = identity,
  } = {}
) => {
  let enableInitiator = initialenableInitiator;
  let initiatorParentElement = initialInitiatorParentElement;
  let longPressIndicatorParentElement = initialLongPressIndicatorParentElement;

  let onDraw = initialOnDraw;
  let onStart = initialOnStart;
  let onEnd = initialOnEnd;

  let minDelay = initialMinDelay;
  let minDist = initialMinDist;

  let pointNorm = initialPointNorm;

  const initiator = document.createElement('div');
  const initiatorId =
    Math.random().toString(36).substring(2, 5) +
    Math.random().toString(36).substring(2, 5);
  initiator.id = `lasso-initiator-${initiatorId}`;
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

  const {
    longPress,
    longPressCircle,
    longPressCircleLeft,
    longPressCircleRight,
    longPressEffect,
  } = createLongPressElements();

  let isMouseDown = false;
  let isLasso = false;
  let lassoPos = [];
  let lassoPosFlat = [];
  let lassoPrevMousePos;
  let longPressIsStarting = false;

  let longPressMainInAnimationRuleIndex = null;
  let longPressEffectInAnimationRuleIndex = null;
  let longPressCircleLeftInAnimationRuleIndex = null;
  let longPressCircleRightInAnimationRuleIndex = null;
  let longPressCircleInAnimationRuleIndex = null;
  let longPressMainOutAnimationRuleIndex = null;
  let longPressEffectOutAnimationRuleIndex = null;
  let longPressCircleLeftOutAnimationRuleIndex = null;
  let longPressCircleRightOutAnimationRuleIndex = null;
  let longPressCircleOutAnimationRuleIndex = null;

  const mouseUpHandler = () => {
    isMouseDown = false;
  };

  const getMousePosition = (event) => {
    const { left, top } = element.getBoundingClientRect();

    return [event.clientX - left, event.clientY - top];
  };

  window.addEventListener('mouseup', mouseUpHandler);

  const resetInitiatorStyle = () => {
    initiator.style.opacity = 0.5;
    initiator.style.transform = 'translate(-50%,-50%) scale(0) rotate(0deg)';
  };

  const getCurrentTransformStyle = (node, hasRotated) => {
    const computedStyle = getComputedStyle(node);
    const opacity = +computedStyle.opacity;
    // The css rule `transform: translate(-1, -1) scale(0.5);` is represented as
    // `matrix(0.5, 0, 0, 0.5, -1, -1)`
    const m = computedStyle.transform.match(/([0-9.-]+)+/g);

    const a = +m[0];
    const b = +m[1];

    const scale = Math.sqrt(a * a + b * b);
    let rotate = Math.atan2(b, a) * (180 / Math.PI);

    rotate = hasRotated && rotate <= 0 ? 360 + rotate : rotate;

    return { opacity, scale, rotate };
  };

  const showInitiator = (event) => {
    if (!enableInitiator || isMouseDown) return;

    const x = event.clientX;
    const y = event.clientY;
    initiator.style.top = `${y}px`;
    initiator.style.left = `${x}px`;

    const style = getCurrentTransformStyle(initiator);
    const opacity = style.opacity;
    const scale = style.scale;
    const rotate = style.rotate;
    initiator.style.opacity = opacity;
    initiator.style.transform = `translate(-50%,-50%) scale(${scale}) rotate(${rotate}deg)`;

    initiator.style.animation = 'none';

    // See https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Tips
    // why we need to wait for two animation frames
    nextAnimationFrame().then(() => {
      if (inAnimationRuleIndex !== null) removeRule(inAnimationRuleIndex);

      inAnimationRuleIndex = addRule(
        createInAnimationRule(opacity, scale, rotate)
      );

      initiator.style.animation = inAnimation;

      nextAnimationFrame().then(() => {
        resetInitiatorStyle();
      });
    });
  };

  const hideInitiator = () => {
    const { opacity, scale, rotate } = getCurrentTransformStyle(initiator);
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
        resetInitiatorStyle();
      });
    });
  };

  const showLongPressIndicator = (
    x,
    y,
    {
      time = DEFAULT_LASSO_LONG_PRESS_TIME,
      extraTime = DEFAULT_LASSO_LONG_PRESS_AFTER_EFFECT_TIME,
      delay = DEFAULT_LASSO_LONG_PRESS_EFFECT_DELAY,
    } = {
      time: DEFAULT_LASSO_LONG_PRESS_TIME,
      extraTime: DEFAULT_LASSO_LONG_PRESS_AFTER_EFFECT_TIME,
      delay: DEFAULT_LASSO_LONG_PRESS_EFFECT_DELAY,
    }
  ) => {
    longPressIsStarting = true;

    const mainStyle = getComputedStyle(longPress);
    longPress.style.color = mainStyle.color;
    longPress.style.top = `${y}px`;
    longPress.style.left = `${x}px`;
    longPress.style.animation = 'none';

    const circleStyle = getComputedStyle(longPressCircle);
    longPressCircle.style.clipPath = circleStyle.clipPath;
    longPressCircle.style.opacity = circleStyle.opacity;
    longPressCircle.style.animation = 'none';

    const effectStyle = getCurrentTransformStyle(longPressEffect);
    longPressEffect.style.opacity = effectStyle.opacity;
    longPressEffect.style.transform = `scale(${effectStyle.scale})`;
    longPressEffect.style.animation = 'none';

    const circleLeftStyle = getCurrentTransformStyle(longPressCircleLeft);
    longPressCircleLeft.style.transform = `rotate(${circleLeftStyle.rotate}deg)`;
    longPressCircleLeft.style.animation = 'none';

    const circleRightStyle = getCurrentTransformStyle(longPressCircleRight);
    longPressCircleRight.style.transform = `rotate(${circleRightStyle.rotate}deg)`;
    longPressCircleRight.style.animation = 'none';

    nextAnimationFrame().then(() => {
      if (!longPressIsStarting) return;

      if (longPressCircleInAnimationRuleIndex !== null)
        removeRule(longPressCircleInAnimationRuleIndex);
      if (longPressCircleRightInAnimationRuleIndex !== null)
        removeRule(longPressCircleRightInAnimationRuleIndex);
      if (longPressCircleLeftInAnimationRuleIndex !== null)
        removeRule(longPressCircleLeftInAnimationRuleIndex);
      if (longPressEffectInAnimationRuleIndex !== null)
        removeRule(longPressEffectInAnimationRuleIndex);
      if (longPressMainInAnimationRuleIndex !== null)
        removeRule(longPressMainInAnimationRuleIndex);

      const { rules, names } = createLongPressInAnimations({
        time,
        extraTime,
        delay,
        currentColor: mainStyle.color || 'currentcolor',
        targetColor: longPress.dataset.activeColor,
        effectOpacity: effectStyle.opacity || 0,
        effectScale: effectStyle.scale || 0,
        circleLeftRotation: circleLeftStyle.rotate || 0,
        circleRightRotation: circleRightStyle.rotate || 0,
        circleClipPath: circleStyle.clipPath || 'inset(0 0 0 50%)',
        circleOpacity: circleStyle.opacity || 0,
      });

      longPressMainInAnimationRuleIndex = addRule(rules.main);
      longPressEffectInAnimationRuleIndex = addRule(rules.effect);
      longPressCircleLeftInAnimationRuleIndex = addRule(rules.circleLeft);
      longPressCircleRightInAnimationRuleIndex = addRule(rules.circleRight);
      longPressCircleInAnimationRuleIndex = addRule(rules.circle);

      longPress.style.animation = names.main;
      longPressEffect.style.animation = names.effect;
      longPressCircleLeft.style.animation = names.circleLeft;
      longPressCircleRight.style.animation = names.circleRight;
      longPressCircle.style.animation = names.circle;
    });
  };

  const hideLongPressIndicator = (
    { time = DEFAULT_LASSO_LONG_PRESS_REVERT_EFFECT_TIME } = {
      time: DEFAULT_LASSO_LONG_PRESS_REVERT_EFFECT_TIME,
    }
  ) => {
    if (!longPressIsStarting) return;

    longPressIsStarting = false;

    const mainStyle = getComputedStyle(longPress);
    longPress.style.color = mainStyle.color;
    longPress.style.animation = 'none';

    const circleStyle = getComputedStyle(longPressCircle);
    longPressCircle.style.clipPath = circleStyle.clipPath;
    longPressCircle.style.opacity = circleStyle.opacity;
    longPressCircle.style.animation = 'none';

    const effectStyle = getCurrentTransformStyle(longPressEffect);
    longPressEffect.style.opacity = effectStyle.opacity;
    longPressEffect.style.transform = `scale(${effectStyle.scale})`;
    longPressEffect.style.animation = 'none';

    // The first half of the circle animation, the clip-path is set to `inset(0px 0px 0px 50%)`.
    // In the second half it's set to `inset(0px)`. Hence we can look at the second to last
    // character to determine if the animatation has progressed passed half time.
    const isAnimatedMoreThan50Percent =
      circleStyle.clipPath.slice(-2, -1) === 'x';

    const circleLeftStyle = getCurrentTransformStyle(
      longPressCircleLeft,
      isAnimatedMoreThan50Percent
    );
    longPressCircleLeft.style.transform = `rotate(${circleLeftStyle.rotate}deg)`;
    longPressCircleLeft.style.animation = 'none';

    const circleRightStyle = getCurrentTransformStyle(longPressCircleRight);
    longPressCircleRight.style.transform = `rotate(${circleRightStyle.rotate}deg)`;
    longPressCircleRight.style.animation = 'none';

    nextAnimationFrame().then(() => {
      if (longPressCircleOutAnimationRuleIndex !== null)
        removeRule(longPressCircleOutAnimationRuleIndex);
      if (longPressCircleRightOutAnimationRuleIndex !== null)
        removeRule(longPressCircleRightOutAnimationRuleIndex);
      if (longPressCircleLeftOutAnimationRuleIndex !== null)
        removeRule(longPressCircleLeftOutAnimationRuleIndex);
      if (longPressEffectOutAnimationRuleIndex !== null)
        removeRule(longPressEffectOutAnimationRuleIndex);
      if (longPressMainOutAnimationRuleIndex !== null)
        removeRule(longPressMainOutAnimationRuleIndex);

      const { rules, names } = createLongPressOutAnimations({
        time,
        currentColor: mainStyle.color || 'currentcolor',
        targetColor: longPress.dataset.color,
        effectOpacity: effectStyle.opacity || 0,
        effectScale: effectStyle.scale || 0,
        circleLeftRotation: circleLeftStyle.rotate || 0,
        circleRightRotation: circleRightStyle.rotate || 0,
        circleClipPath: circleStyle.clipPath || 'inset(0px)',
        circleOpacity: circleStyle.opacity || 1,
      });

      longPressMainOutAnimationRuleIndex = addRule(rules.main);
      longPressEffectOutAnimationRuleIndex = addRule(rules.effect);
      longPressCircleLeftOutAnimationRuleIndex = addRule(rules.circleLeft);
      longPressCircleRightOutAnimationRuleIndex = addRule(rules.circleRight);
      longPressCircleOutAnimationRuleIndex = addRule(rules.circle);

      longPress.style.animation = names.main;
      longPressEffect.style.animation = names.effect;
      longPressCircleLeft.style.animation = names.circleLeft;
      longPressCircleRight.style.animation = names.circleRight;
      longPressCircle.style.animation = names.circle;
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
    if (currLassoPos.length) {
      onEnd(currLassoPos, currLassoPosFlat, { merge });
    }

    return currLassoPos;
  };

  const set = ({
    onDraw: newOnDraw = null,
    onStart: newOnStart = null,
    onEnd: newOnEnd = null,
    enableInitiator: newEnableInitiator = null,
    initiatorParentElement: newInitiatorParentElement = null,
    longPressIndicatorParentElement: newLongPressIndicatorParentElement = null,
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

    if (
      newLongPressIndicatorParentElement !== null &&
      newLongPressIndicatorParentElement !== longPressIndicatorParentElement
    ) {
      longPressIndicatorParentElement.removeChild(longPress);
      newLongPressIndicatorParentElement.appendChild(longPress);
      longPressIndicatorParentElement = newLongPressIndicatorParentElement;
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
    longPressIndicatorParentElement.removeChild(longPress);
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
      showLongPressIndicator,
      hideLongPressIndicator,
    });

  initiatorParentElement.appendChild(initiator);
  longPressIndicatorParentElement.appendChild(longPress);

  set({
    onDraw,
    onStart,
    onEnd,
    enableInitiator,
    initiatorParentElement,
  });

  return pipe(
    withStaticProperty('initiator', initiator),
    withStaticProperty('longPressIndicator', longPress),
    withPublicMethods(),
    withConstructor(createLasso)
  )({});
};

export default createLasso;
