/**
 * Returns validated frame number between first and last frame
 * @param {Number} frameNumber
 * @param {Number} totalFrames
 * @returns {Number}
 */
export function normalizeFrameNumber(frameNumber, totalFrames){
    frameNumber = Math.floor(frameNumber);
    if (frameNumber <= 0) {
        return 1;
    } else if (frameNumber > totalFrames) {
        return totalFrames;
    }
    return frameNumber;
}

/**
 * Object.assign polyfill from mdn
 *
 * @param {Object} target
 * @param {Object} firstSource
 * @returns {Object}
 */
export function mergeObjects(target, firstSource) {
    if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
    }

    var to = Object(target);
    for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
            continue;
        }

        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
            var nextKey = keysArray[nextIndex];
            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
            if (desc !== undefined && desc.enumerable) {
                to[nextKey] = nextSource[nextKey];
            }
        }
    }
    return to;
}

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
export function isNumeric(str) {
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

export function isOutOfRange(frame, frames){
    return ( frame <= 0 || frame > frames );
}
