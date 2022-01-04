import { validateParameters, getSettings } from "./settings";
import { isOutOfRange, normalizeFrameNumber } from "./utils";
import DragInput from "./DragInput";
import Animation from "./Animation";

/**
 * @param {Element|HTMLElement} node - DOM Node
 * @param {Object} options - Options
 * @param {Number} options.width - Width of one frame
 * @param {Number} options.height - Height of one frame
 * @param {Number} options.frames - Number of frames
 * @param {Number|Boolean} [options.cols=false] - Number of cols if more than 1 row
 * @param {Boolean} [options.loop=false] - Whether to start a new cycle at the end
 * @param {Boolean} [options.reverse=false] - Reverse direction
 * @param {Boolean} [options.autoplay=false] - Autoplay
 * @param {Number|Boolean} [options.frameTime] - ms, time between frames
 * @param {Number|Boolean} [options.duration] - ms, total time, alternative to frameTime
 * @param {Number|Boolean} [options.fps = 24] - fps, alternative to frameTime
 * @param {Number|Boolean} [options.draggable = false] - Draggable by mouse or touch
 * @param {String} [options.touchScrollMode = "pageScrollTimer"] - Page scroll behavior with touch events
 * (preventPageScroll,allowPageScroll, pageScrollTimer)
 * @param {Number} [options.pageScrollTimerDelay = 1500] - Time in ms when touch scroll will be disabled during interaction
 * if options.touchScrollMode = "pageScrollTimer"
 * @returns {Object}
 * @example
 *
 * var sprite = animateSprite.init( document.getElementById('sprite'),
 *             {
 *                 width: 720,
 *                 height: 405,
 *                 cols: 5,
 *                 frames: 20,
 *                 frameTime: 45,
 *                 loop: true
 *              }
 */
export function init(node, options = {}) {
    validateParameters(node, options);
    let settings = getSettings(node, options);

    let data = {
        currentFrame: 1,
        nodeWidth: null,
        nodeHeight: null,
        widthHeightRatio: null,
        bgWidth: null,
        bgHeight: null,
        element: node,
        pluginApi: {}
    }
    // Classes
    let dragInput,
        animation;


    function initPlugin(){
        animation = new Animation( {settings, data, changeFrame} );

        calculateSizes();
        addResizeHandler(calculateSizes);

        if ( settings.autoplay ) plugin.play();
        if ( settings.draggable ) toggleDrag(true);
    }

    // Private functions
    function animateSprite(frame) {
        node.style.backgroundPosition = calculatePosition(frame);
    }
    function changeFrame(frameNumber, force = false){
        if (frameNumber === data.currentFrame) return;//skip same frame
        animateSprite(frameNumber);
        data.currentFrame = frameNumber
    }

    function calculatePosition(frame){
        let xPadding,
            yPadding = 0;
        if ( !settings.cols ){ // Single row sprite
            xPadding = (frame - 1) * data.nodeWidth;
        } else { // Multiline sprite
            xPadding = ( ( (frame - 1) % settings.cols)  ) * data.nodeWidth;
            yPadding = Math.floor( (frame - 1) / settings.cols ) * data.nodeHeight;
        }
        return `-${xPadding}px -${yPadding}px`;
    }

    function calculateSizes(){
        const wasAnimating = animation.isAnimating;
        plugin.stop();
        data.widthHeightRatio = settings.width / settings.height;
        data.nodeWidth = node.offsetWidth;
        data.nodeHeight = data.nodeWidth / data.widthHeightRatio;
        node.style.height = data.nodeHeight + "px";
        data.bgWidth =  ( !settings.cols )
            ? settings.frames * data.nodeWidth
            : settings.cols * data.nodeWidth;
        data.bgHeight = ( !settings.cols )
            ? data.nodeHeight
            : Math.ceil( settings.frames / settings.cols ) * data.nodeHeight;
        node.style.backgroundSize = `${data.bgWidth}px ${data.bgHeight}px`;
        if (wasAnimating) plugin.play();
            else animateSprite(data.currentFrame);
        if ( dragInput ) dragInput.updateThreshold()
    }

    function toggleDrag(enable = true){
        if (enable) {
            if ( !dragInput ) dragInput = new DragInput({
                data,
                settings,
                changeFrame,
                getNextFrame: animation.getNextFrame.bind(animation)
            });
            dragInput.enableDrag();
        } else {
            if (dragInput) dragInput.disableDrag();
        }
    }

    // Public API'
    let plugin = {};
    plugin.play = function(){
        if ( animation.isAnimating ) return;
        animation.play();
        return this;
    }
    plugin.stop = function(){
        animation.stop();
        return this;
    }
    plugin.toggle = function(){
        if ( !animation.isAnimating ) plugin.play();
        else plugin.stop();
        return this;
    }
    plugin.next = function(){
        plugin.stop();
        changeFrame( animation.getNextFrame(1) );
        return this;
    }
    plugin.prev = function(){
        plugin.stop();
        changeFrame( animation.getNextFrame(1, !settings.reverse) );
        return this;
    }
    plugin.reset = function(){
        plugin.stop();
        changeFrame(normalizeFrameNumber(1, settings.frames));
        return this;
    }
    plugin.setFrame = function(frameNumber){
        plugin.stop();
        changeFrame(normalizeFrameNumber(frameNumber, settings.frames));
        return this;
    }
    plugin.setReverse = function(reverse = true){
        settings.reverse = !!reverse;
        return this;
    }
    plugin.getCurrentFrame = () => data.currentFrame;
    plugin.isAnimating = () => animation.isAnimating;
    plugin.setOption = function (option, value) {
        if ( option === "frameTime" || option === "duration" || option === "fps" ) {
            settings.frameTime = settings.duration = settings.fps = false; // Reset
            settings[option] = +value;
            animation.updateDuration();
            if ( animation.isAnimating ) {
                plugin.stop();
                plugin.play();
            }
        }
        return this;
    };
    plugin.destroy = function () {
        plugin.stop();
        toggleDrag(false);
        removeResizeHandler( calculateSizes );
    }
    data.pluginApi = plugin;

    initPlugin();
    return plugin;
}


function addResizeHandler(cb) {
    window.addEventListener("resize", cb); // todo add debouncing
}
function removeResizeHandler(cb) {
    window.removeEventListener("resize", cb);
}


