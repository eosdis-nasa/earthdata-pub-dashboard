'use strict';

export default function log () {
  if (arguments[0].match(/UPLOAD_INFLIGHT/g)) {
    console.log.apply(console, ['UPLOAD_INFLIGHT']);
  } else {
    console.log.apply(console, arguments);
  }
}
