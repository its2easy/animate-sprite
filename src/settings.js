import {mergeObjects} from "./utils";

export function validateParameters(node, options){
    if ( !(node instanceof HTMLElement || node instanceof Element || node instanceof HTMLDocument)) {
        throw new TypeError('Node is required');
    }
}

export function getSettings(node, options){
    // Setup settings
    let inlineSettings = fillInlineSettings( node,
        ['width', 'height', 'frames', 'cols', 'loop', 'frameTime', 'duration', 'fps', 'reverse', 'autoplay', 'draggable']
    );
    return {...defaultSettings, ...options, ...inlineSettings};
}

const defaultSettings = {
    width: 100,
    height: 100,
    frames: 24,
    cols: false,
    loop: false,
    frameTime: false,
    duration: false,
    fps: 24,
    reverse: false,
    autoplay: false,
    draggable: false,
    touchScrollMode: "pageScrollTimer",
    pageScrollTimerDelay: 1500,
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
    list.forEach( (value) => {
        if (typeof node.dataset[value.toLowerCase()] !== 'undefined') {
            let inlineValue = node.dataset[value.toLowerCase()];
            if ( inlineValue === "true" || inlineValue === '') inlineValue = true;
            else if ( inlineValue === "false") inlineValue = false;
            result[value] = inlineValue;
        }
    });
    return result;
}
