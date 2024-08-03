import createKDBushClass from './kdbush-class';
import workerFn from './kdbush-worker';

const KDBush = createKDBushClass();
const WORKER_THRESHOLD = 1000000;

const createWorker = (fn) => {
  const kdbushStr = createKDBushClass.toString();
  const fnStr = fn.toString();
  const workerStr =
    `const createKDBushClass = ${kdbushStr};` +
    'KDBush = createKDBushClass();' +
    `const createWorker = ${fnStr};` +
    'createWorker();';

  return new Worker(
    window.URL.createObjectURL(
      new Blob([workerStr], {
        type: 'text/javascript',
      })
    )
  );
};

/**
 * Create KDBush from an either point data or an existing spatial index
 * @param {import('./types').Points | ArrayBuffer} pointsOrIndex - Points or KDBush index
 * @param {Partial<import('./types').CreateKDBushOptions>} options - Options for configuring the index and its creation
 * @return {Promise<KDBush>} KDBush instance
 */
const createKdbush = (
  pointsOrIndex,
  options = { nodeSize: 16, useWorker: undefined }
) =>
  new Promise((resolve, reject) => {
    if (pointsOrIndex instanceof ArrayBuffer) {
      resolve(KDBush.from(pointsOrIndex));
    } else if (
      (pointsOrIndex.length < WORKER_THRESHOLD ||
        options.useWorker === false) &&
      options.useWorker !== true
    ) {
      const index = new KDBush(pointsOrIndex.length, options.nodeSize);
      for (let i = 0; i < pointsOrIndex.length; ++i) {
        index.add(pointsOrIndex[i][0], pointsOrIndex[i][1]);
      }
      index.finish();
      resolve(index);
    } else {
      const worker = createWorker(workerFn);

      worker.onmessage = (e) => {
        if (e.data.error) reject(e.data.error);
        else resolve(KDBush.from(e.data));
        worker.terminate();
      };

      worker.postMessage({ points: pointsOrIndex, nodeSize: options.nodeSize });
    }
  });

export default createKdbush;
