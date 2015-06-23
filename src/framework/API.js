/**
 * @copyright 2015 Prometheus Research LLC
 */

let SOURCE_MAP = undefined;

window.__webtest_sourceMap__ = SOURCE_MAP;

function fetchSourceMap() {
  if (SOURCE_MAP === undefined) {
    let request = new XMLHttpRequest();
    request.open('GET', '/bundle.js.map', false);
    request.send(null);

    if (request.status === 200) {
      SOURCE_MAP = JSON.parse(request.responseText);
    } else {
      SOURCE_MAP = null;
    }
  }
  return SOURCE_MAP;
}

let API = {
  fetchSourceMap
};

window.__Webtest__ = API;

export default API;
