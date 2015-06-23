/**
 * @copyright 2015 Prometheus Research LLC
 */

import Promise from 'bluebird';

export async function concatMapPromise(func, array) {
  let promises = array.map(item => func(item));
  let resolutions = await Promise.all(promises);
  return concat(resolutions);
}

export function concat(arrays) {
  var result = [];
  for (var i = 0; i < arrays.length; i++) {
    result = result.concat(arrays[i]);
  }
  return result;
}
