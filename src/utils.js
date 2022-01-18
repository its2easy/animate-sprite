/**
 * Returns validated frame number between the first and the last frame
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
