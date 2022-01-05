import {capitalizeFirstLetter, isNumeric} from "./utils";

export function validateParameters(node, options){
    if ( !(node instanceof HTMLElement || node instanceof Element || node instanceof HTMLDocument)) {
        throw new TypeError('Node is required');
    }
}

export function getSettings(node, options){
    let inlineSettings = fillInlineSettings( node, getSettingsKeys() );
    return {...defaultSettings, ...options, ...inlineSettings};
}

const defaultSettings = {
    width: 100,
    height: 100,
    frames: 24,
    cols: false,

    loop: false,
    autoplay: false,
    frameTime: false,
    duration: false,
    fps: 24,
    reverse: false,
    inversion: false,
    draggable: false,
    touchScrollMode: "pageScrollTimer",
    pageScrollTimerDelay: 1500,
}
export function getSettingsKeys(){
    return Object.keys(defaultSettings);
}

/**
 * Returns object with data-* settings
 *
 * @param {HTMLElement} node
 * @param {Array<string>} list
 * @returns {Object}
 */
function fillInlineSettings(node, list) {
    let result = {};
    const prefix = "sprite";

    list.forEach( (value) => {
        const datasetFormattedValue = prefix + capitalizeFirstLetter(value);
        let inlineValue = node.dataset[datasetFormattedValue];

        if (typeof inlineValue !== 'undefined') {
            if ( inlineValue === "true" || inlineValue === '') inlineValue = true;
            else if ( inlineValue === "false") inlineValue = false;
            else if ( isNumeric(inlineValue) ) inlineValue = parseFloat(inlineValue);
            result[value] = inlineValue;
        }
    });
    return result;
}
