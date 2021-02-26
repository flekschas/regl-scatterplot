/* eslint-env worker */
/* eslint no-restricted-globals: 1 */

const worker = function worker() {
  self.onmessage = function onmessage(event) {
    const num = event.data;
    const bins = 10;

    try {
      let points = [];

      const range = 2 / bins;
      const numPerBin = num / bins ** 2;

      for (let i = 0; i < bins; i++) {
        for (let j = 0; j < bins; j++) {
          const xStart = -1 + j * range;
          const yStart = -1 + i * range;
          const tmp = [];
          for (let k = 0; k < numPerBin; k++) {
            tmp.push([
              xStart + Math.random() * range, // x
              yStart + Math.random() * range, // y
              Math.round(Math.random()), // category
              Math.random(), // value
            ]);
          }
          points = points.concat(
            tmp.sort((a, b) => a[0] - b[0] || a[1] - b[1])
          );
        }
      }

      self.postMessage({ points });
    } catch (error) {
      self.postMessage({ error });
    }
  };
};

export default worker;
