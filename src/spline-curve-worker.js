/* eslint-env worker */
/* eslint no-restricted-globals: 1 */

const worker = function worker() {
  const state = {};

  const catmullRom = (t, p0, p1, p2, p3) => {
    const v0 = (p2 - p0) * 0.5;
    const v1 = (p3 - p1) * 0.5;
    return (
      (2 * p1 - 2 * p2 + v0 + v1) * t * t * t +
      (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t * t +
      v0 * t +
      p1
    );
  };

  const getPoint = (t, points, maxPointIdx) => {
    const p = maxPointIdx * t;

    const intPoint = Math.floor(p);
    const weight = p - intPoint;

    const p0 = points[Math.max(0, intPoint - 1)];
    const p1 = points[intPoint];
    const p2 = points[Math.min(maxPointIdx, intPoint + 1)];
    const p3 = points[Math.min(maxPointIdx, intPoint + 2)];

    return [
      catmullRom(weight, p0[0], p1[0], p2[0], p3[0]),
      catmullRom(weight, p0[1], p1[1], p2[1], p3[1]),
    ];
  };

  const sqDist = (x1, y1, x2, y2) => (x1 - x2) ** 2 + (y1 - y2) ** 2;

  const sqSegDist = (p, p1, p2) => {
    let x = p1[0];
    let y = p1[1];
    let dx = p2[0] - x;
    let dy = p2[1] - y;

    if (dx !== 0 || dy !== 0) {
      const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);

      if (t > 1) {
        x = p2[0];
        y = p2[1];
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }

    dx = p[0] - x;
    dy = p[1] - y;

    return dx * dx + dy * dy;
  };

  const simplifyDPStep = (points, first, last, tolerance, simplified) => {
    let maxDist = tolerance;
    let index;

    for (let i = first + 1; i < last; i++) {
      const dist = sqSegDist(points[i], points[first], points[last]);

      if (dist > maxDist) {
        index = i;
        maxDist = dist;
      }
    }

    if (maxDist > tolerance) {
      if (index - first > 1)
        simplifyDPStep(points, first, index, tolerance, simplified);
      simplified.push(points[index]);
      if (last - index > 1)
        simplifyDPStep(points, index, last, tolerance, simplified);
    }
  };

  const simplifyDouglasPeucker = (points, sqTolerance) => {
    const last = points.length - 1;
    const simplified = [points[0]];

    simplifyDPStep(points, 0, last, sqTolerance, simplified);
    simplified.push(points[last]);

    return simplified;
  };

  const getPoints = (
    points,
    { maxIntPointsPerSegment = 100, tolerance = 0.002 } = {}
  ) => {
    const numPoints = points.length;
    const maxPointIdx = numPoints - 1;

    const maxOutPoints = maxPointIdx * maxIntPointsPerSegment + 1;
    const sqTolerance = tolerance ** 2;

    let outPoints = [];
    let prevPoint;

    // Generate interpolated points where the squared-distance between points
    // is larger than sqTolerance
    for (let i = 0; i < numPoints - 1; i++) {
      let segmentPoints = [points[i].slice(0, 2)];
      // outPoints.push(points[i].slice(0, 2));
      prevPoint = points[i];

      for (let j = 1; j < maxIntPointsPerSegment; j++) {
        const t = (i * maxIntPointsPerSegment + j) / maxOutPoints;
        const intPoint = getPoint(t, points, maxPointIdx);

        // Check squared distance simplification
        if (
          sqDist(prevPoint[0], prevPoint[1], intPoint[0], intPoint[1]) >
          sqTolerance
        ) {
          segmentPoints.push(intPoint);
          prevPoint = intPoint;
        }
      }

      // Add next key point. Needed for the simplification algorithm
      segmentPoints.push(points[i + 1]);
      // Simplify interpolated points using the douglas-peuckner algorithm
      segmentPoints = simplifyDouglasPeucker(segmentPoints, sqTolerance);
      // Add simplified points without the last key point, which is added
      // anyway in the next segment
      outPoints = outPoints.concat(
        segmentPoints.slice(0, segmentPoints.length - 1)
      );
    }
    outPoints.push(points[points.length - 1].slice(0, 2));

    return outPoints.flat();
  };

  const stratifyPoints = (points) => {
    const stratifiedPoints = [];

    points.forEach((point) => {
      const isStruct = Array.isArray(point[4]);
      const segId = isStruct ? point[4][0] : point[4];

      if (!stratifiedPoints[segId]) stratifiedPoints[segId] = [];

      if (isStruct) stratifiedPoints[segId][point[4][1]] = point;
      else stratifiedPoints[segId].push(point);
    });

    // The filtering ensures that non-existing array entries are removed
    return stratifiedPoints.filter((x) => x).map((x) => x.filter((v) => v));
  };

  self.onmessage = function onmessage(event) {
    const numPoints = event.data.points ? +event.data.points.length : 0;

    if (!numPoints)
      self.postMessage({ error: new Error('No points provided') });

    state.points = event.data.points;

    const stratifiedPoints = stratifyPoints(event.data.points);

    const outPoints = stratifiedPoints.map((connectedPoints, i) => {
      const curvePoints = getPoints(
        connectedPoints,
        event.data.options,
        i === 0
      );
      return curvePoints;
    });

    self.postMessage({ points: outPoints });
  };
};

export default worker;
