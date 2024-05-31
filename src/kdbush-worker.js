/* eslint-env worker */
/* eslint no-restricted-globals: 1 */

export default () => {
  addEventListener('message', (event) => {
    const points = event.data.points;

    if (!points.length) {
      self.postMessage({ error: new Error('Invalid point data') });
    }

    // eslint-disable-next-line no-undef
    const index = new KDBush(points.length, event.data.nodeSize);

    for (let i = 0; i < points.length; ++i) {
      index.add(points[i][0], points[i][1]);
    }

    index.finish();

    postMessage(index.data, [index.data]);
  });
};
