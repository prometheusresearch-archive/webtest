import createStackMapper from 'stack-mapper';

const STACK_RE = /at ([^ ]+) \((.+):([0-9]+):([0-9]+)\)/;
const STACK_RE_NO_COLUMN = /at ([^ ]+) \((.+):([0-9]+)\)/;
const STACK_RE_NO_NAME = /at (.+):([0-9]+):([0-9]+)/;
const STACK_RE_NO_NAME_NO_COLUMN = /at (.+):([0-9]+)/;

export function parseFrame(frame) {
  let m = STACK_RE.exec(frame)
  if (m) {
    frame = {
      name: m[1],
      filename: m[2],
      line: m[3],
      column: m[4] || 0
    };
    return frame;
  }
  m = STACK_RE_NO_NAME.exec(frame)
  if (m) {
    frame = {
      name: null,
      filename: m[1],
      line: m[2],
      column: m[3]
    };
    return frame;
  }
  m = STACK_RE_NO_NAME_NO_COLUMN.exec(frame)
  if (m) {
    frame = {
      name: null,
      filename: m[1],
      line: m[2],
      column: 0
    };
    return frame;
  }
  m = STACK_RE_NO_COLUMN.exec(frame)
  if (m) {
    frame = {
      name: null,
      filename: m[1],
      line: m[2],
      column: 0
    };
    return frame;
  }
  return null;
}

export function formatFrame(frame) {
  if (frame.name) {
    return `    at ${frame.name} (${frame.filename}:${frame.line})`;
  } else {
    return `    at ${frame.filename}:${frame.line}`;
  }
}

export default function formatStackTrace(sourceMap, frames) {
  if (!Array.isArray(frames)) {
    frames = frames
      .split('\n')
      .map(parseFrame)
      .filter(Boolean);
  }
  let filtered = frames
    .filter(f => !/jasmine-core\/lib\/jasmine-core/.exec(f.filename))
    .filter(f => !/webpack\/bootstrap/.exec(f.filename))
    .filter(f => !/framework\/bundle.js/.exec(f.filename));
  if (filtered.length > 0) {
    frames = filtered;
  }
  if (sourceMap) {
    frames = createStackMapper(sourceMap).map(frames);
  }
  frames = frames
    .map(f => ({...f, filename: f.filename.replace(/^webpack:\/\/\//, '')}))
    .filter(f => !/webpack\/bootstrap/.exec(f.filename))
    .map(formatFrame);
  return frames.join('\n');
}
