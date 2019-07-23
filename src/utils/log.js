"use strict";

function log(error, metaData, type = null) {
  if (metaData.result) {
    const shouldBeError = type === "error" ? true : metaData.options.bail;

    if (shouldBeError) {
      metaData.result.errors.push(error);
    } else {
      metaData.result.warnings.push(error);
    }

    return;
  }

  throw error;
}

module.exports = log;
