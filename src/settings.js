import { capitalizeFirstLetter, isNumeric } from "./utils";

export function validateParameters(node, options){
    if ( !(node instanceof HTMLElement || node instanceof Element || node instanceof HTMLDocument)) {
        throw new TypeError('Node is required');
    }
}
export function validateSettings(options){
    ["width", "height", "frames"].forEach((el)=> {
        options[el] = parseInt(options[el], 10);
        if ( !isNumeric(options[el]) ) throw new TypeError(`options.${el} is required and must be a number`);
    });
    ["cols", "frameTime", "fps", "duration", "pageScrollTimerDelay"].forEach((el)=> {
        if (options[el] ) options[el] = parseInt(options[el], 10);
    });
    if ('dragModifier' in options) options.dragModifier = Math.abs(+options.dragModifier);
}

export function getSettings(node, options){
    let inlineSettings = fillInlineSettings( node, getSettingsKeys() );
    return {...defaultSettings, ...options, ...inlineSettings};
}

const defaultSettings = {
    width: undefined,
    height: undefined,
    frames: undefined,
    cols: false,

    loop: false,
    autoplay: false,
    frameTime: false,
    duration: false,
    fps: 24,
    reverse: false,
    inversion: false,
    draggable: false,
    dragModifier: 1,
    touchScrollMode: "pageScrollTimer",
    pageScrollTimerDelay: 1500,
    onAnimationEnd: undefined,
    onAfterFrameChange: undefined,
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
