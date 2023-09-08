'use strict';

export default function log () {
  if (arguments[0].match(/UPLOAD/g)) {
    console.log.apply(console, ['UPLOAD']);
  } else {
    console.log.apply(console, arguments);
  }
}
