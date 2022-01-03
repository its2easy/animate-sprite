import { validateParameters, getSettings } from "./settings";
import DragInput from "./DragInput";

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
        isAnimating: false,
        duration: null, // One animation cycle duration
        lastUpdate: null,
        isSwiping: false,
        nodeWidth: null,
        nodeHeight: null,
        widthHeightRatio: null,
        bgWidth: null,
        bgHeight: null,
        element: node,
        pluginApi: {}
    }
    // Classes
    let dragInput;


    function initPlugin(){
        data.duration = calculateDuration(settings.frameTime, settings.duration, settings.fps);
        data.lastUpdate = performance.now();

        calculateSizes();
        addResizeHandler(calculateSizes);

        if ( settings.autoplay ) plugin.play();
        if ( settings.draggable ) toggleDrag(true);
    }

    // Private functions
    function animateSprite(frame) {
        node.style.backgroundPosition = calculatePosition(frame);
    }
    function changeFrame(frame, force = false){
        if ( frame === data.currentFrame && !force ) return;
        if ( !isOutOfRange(frame) ){ // Valid frame
            animateSprite(frame);
            checkForEvents(data.currentFrame, frame);
            data.currentFrame = frame;
        } else { // Out of range
            if (settings.loop) { // Loop, change frame and continue
                changeFrame( Math.abs(Math.abs(frame) - settings.frames) ); // Correct frame
            } else { // No loop, stop playing
                plugin.stop();
                if (frame < 1) changeFrame(1);
                else changeFrame(settings.frames);
            }
        }
    }
    function getNextFrame(deltaFrames, reverse){
        if ( reverse === undefined ) reverse = settings.reverse;
        return  (reverse) ? data.currentFrame - deltaFrames : data.currentFrame + deltaFrames;
    }
    function isOutOfRange(frame){
        return ( frame <= 0 || frame > settings.frames );
    }
    function calculatePosition(frame){
        let xPadding,
            yPadding = 0;
        if ( !settings.cols ){ // Single row sprite
            xPadding = (frame - 1) * nodeWidth;
        } else { // Multiline sprite
            xPadding = ( ( (frame - 1) % settings.cols)  ) * data.nodeWidth;
            yPadding = Math.floor( (frame - 1) / settings.cols ) * data.nodeHeight;
        }
        return `-${xPadding}px -${yPadding}px`;
    }
    function calculateDuration(frameTime, duration, fps){
        if (frameTime) return frameTime * settings.frames;
        else if (duration) return duration;
        else return  ( settings.frames / fps ) * 1000;
    }
    function animate(time){
        const progress = ( time - data.lastUpdate ) / data.duration;
        //console.log(time - lastUpdate);
        const deltaFrames = progress * settings.frames; // Ex. 0.45 or 1.25
        // A place for timing function

        if ( deltaFrames >= 1) { // Animate only if we need to update 1 frame or more
            changeFrame(getNextFrame( Math.floor(deltaFrames) ));
            data.lastUpdate = performance.now();
        }
        if ( data.isAnimating ) requestAnimationFrame(animate);
    }

    function calculateSizes(){
        const wasAnimating = data.isAnimating;
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
        else changeFrame(data.currentFrame, true);
        if ( dragInput ) dragInput.updateThreshold()
    }
    function checkForEvents(prevFrame, nextFrame) {
        if ( (prevFrame === settings.frames - 1) && (nextFrame === settings.frames) ){
            node.dispatchEvent( new Event('sprite:last-frame') );
        } else if ( (prevFrame === 2) && (nextFrame === 1) ) {
            node.dispatchEvent( new Event('sprite:first-frame') );
        }
    }

    function toggleDrag(enable = true){
        if (enable) {
            if ( !dragInput ) dragInput = new DragInput({
                data,
                settings,
                changeFrame,
                getNextFrame: getNextFrame
            });
            dragInput.enableDrag();
        } else {
            if (dragInput) dragInput.disableDrag();
        }
    }

    // Public API'
    let plugin = {};
    plugin.play = function(){
        if ( data.isAnimating ) return;
        data.isAnimating = true;
        data.lastUpdate = performance.now();
        requestAnimationFrame(animate);
        return this;
    }
    plugin.stop = function(){
        data.isAnimating = false;
        return this;
    }
    plugin.toggle = function(){
        if ( !data.isAnimating ) plugin.play();
        else plugin.stop();
        return this;
    }
    plugin.next = function(){
        plugin.stop();
        changeFrame( data.currentFrame + 1 );
        return this;
    }
    plugin.prev = function(){
        plugin.stop();
        changeFrame( data.currentFrame - 1 );
        return this;
    }
    plugin.reset = function(){
        plugin.stop();
        changeFrame(1);
        return this;
    }
    plugin.setFrame = function(frame){
        plugin.stop();
        changeFrame(frame);
        return this;
    }
    plugin.setReverse = function(reverse = true){
        settings.reverse = !!reverse;
        return this;
    }
    plugin.getCurrentFrame = () => data.currentFrame;
    plugin.isAnimating = () => data.isAnimating;
    plugin.setOption = function (option, value) {
        if ( option === "frameTime" || option === "duration" || option === "fps" ) {
            settings.frameTime = settings.duration = settings.fps = false; // Reset
            settings[option] = +value;
            data.duration = calculateDuration(settings.frameTime, settings.duration, settings.fps); // Recalculate
            if ( data.isAnimating ) {
                plugin.stop();
                plugin.play();
            }
        }
        return this;
    };
    plugin.destroy = function () {
        //removeSwipeEvents( node, swipeHandler, swipeEvents );
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


