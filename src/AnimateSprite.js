import { validateParameters, validateSettings, getSettings, getSettingsKeys } from "./settings";
import { normalizeFrameNumber } from "./utils";
import DragInput from "./DragInput";
import Animation from "./Animation";

//todo core-js 3.21 adds es.error.cause(wasm polyfill?) to every file, current 3.20 is ok, check in the future
/**
 * Animate Sprite {@link https://github.com/its2easy/animate-sprite/}
 * @example
 * let sprite = new AnimateSprite( document.getElementById('sprite'), {
 *     width: 720,
 *     height: 405,
 *     frames: 20,
 *     cols: 5,
 *     fps: 60,
 * });
 */
export default class AnimateSprite {
    #settings;
    #data = {
        currentFrame: 1,
        nodeWidth: null,
        nodeHeight: null,
        element: null,
        pluginApi: {},
    }
    #boundCalculateSizes;
    // Classes
    #dragInput;
    #animation;

    /**
     * Creates plugin instance
     * @param {Element|HTMLElement} node - HTML element
     * @param {PluginOptions} options
     */
    constructor( node, options ) {
        validateParameters(node, options);
        this.#settings = getSettings(node, options);
        validateSettings(this.#settings);
        this.#data.element = node;
        this.#data.pluginApi = this;
        this.#boundCalculateSizes = this.#calculateSizes.bind(this);
        this.#initPlugin();
    }

    #initPlugin(){
        this.#animation = new Animation(
            {settings: this.#settings, data: this.#data, changeFrame: this.#changeFrame.bind(this)} );
        this.#calculateSizes();
        this.#toggleResizeHandler(true);

        if ( this.#settings.autoplay ) this.play();
        if ( this.#settings.draggable ) this.#toggleDrag(true);
    }

    #animateSprite(frame) {
        this.#data.element.style.backgroundPosition = this.#calculatePosition(frame);
        if ( this.#settings.onAfterFrameChange ) this.#settings.onAfterFrameChange(this.#data.pluginApi);
    }
    #changeFrame(frameNumber){
        if (frameNumber === this.#data.currentFrame) return;//skip same frame
        this.#animateSprite(frameNumber);
        this.#data.currentFrame = frameNumber;
    }
    #calculatePosition(frame){
        let xPadding, yPadding = 0;
        if ( !this.#settings.cols ){ // Single row sprite
            xPadding = (frame - 1) * this.#data.nodeWidth;
        } else { // Multiline sprite
            xPadding = ( ( (frame - 1) % this.#settings.cols)  ) * this.#data.nodeWidth;
            yPadding = Math.floor( (frame - 1) / this.#settings.cols ) * this.#data.nodeHeight;
        }
        return `-${xPadding}px -${yPadding}px`;
    }

    #calculateSizes(){
        const newNodeWidth = this.#data.element.offsetWidth;
        if (this.#data.nodeWidth === newNodeWidth ) return;//skip if same size

        const wasAnimating = this.#animation.isAnimating,
              widthHeightRatio = this.#settings.width / this.#settings.height;
        this.#data.nodeWidth = newNodeWidth;
        this.#data.nodeHeight = this.#data.nodeWidth / widthHeightRatio;
        this.#data.element.style.height = this.#data.nodeHeight + "px";

        let bgWidth =  ( !this.#settings.cols )
            ? this.#settings.frames * this.#data.nodeWidth
            : this.#settings.cols * this.#data.nodeWidth;
        let bgHeight = ( !this.#settings.cols )
            ? this.#data.nodeHeight
            : Math.ceil( this.#settings.frames / this.#settings.cols ) * this.#data.nodeHeight;
        this.#data.element.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
        if (wasAnimating) this.play();
            else this.#animateSprite(this.#data.currentFrame);
        if ( this.#dragInput ) this.#dragInput.updateThreshold()
    }

    #toggleDrag(enable = true){
        if (enable) {
            if ( !this.#dragInput ) this.#dragInput = new DragInput({
                data: this.#data,
                settings: this.#settings,
                changeFrame: this.#changeFrame.bind(this),
                getNextFrame: this.#animation.getNextFrame.bind(this.#animation)
            });
            this.#dragInput.enableDrag();
        } else {
            if (this.#dragInput) this.#dragInput.disableDrag();
        }
    }

    #toggleResizeHandler(add = true) {
        if ( add ) window.addEventListener("resize", this.#boundCalculateSizes);
        else window.removeEventListener("resize", this.#boundCalculateSizes);
    }

    // Public API

    /**
     * Start animation
     * @returns {AnimateSprite} - plugin instance
     */
    play(){
        if ( !this.#animation.isAnimating ) this.#animation.play();
        return this;
    }
    /**
     * Stop animation
     * @returns {AnimateSprite} - plugin instance
     */
    stop(){
        this.#animation.stop();
        return this;
    }
    /**
     * Toggle between start and stop
     * @returns {AnimateSprite} - plugin instance
     */
    toggle(){
        if (!this.#animation.isAnimating) this.play();
            else this.stop();
        return this;
    }
    /**
     * Show the next frame
     * @returns {AnimateSprite} - plugin instance
     */
    next(){
        this.stop();
        this.#changeFrame( this.#animation.getNextFrame(1) );
        return this;
    }
    /**
     * Show the previous frame
     * @returns {AnimateSprite} - plugin instance
     */
    prev(){
        this.stop();
        this.#changeFrame( this.#animation.getNextFrame(1, !this.#settings.reverse) );
        return this;
    }
    /**
     * Set frame (without animation)
     * @param {number} frameNumber - Number of the frame to show
     * @returns {AnimateSprite} - plugin instance
     */
    setFrame(frameNumber){
        this.stop();
        this.#changeFrame( normalizeFrameNumber(frameNumber, this.#settings.frames) );
        return this;
    }
    /**
     * Starts the animation, that plays until the specified frame number
     * @param {number} frameNumber - Target frame number
     * @param {Object} [options] - Options
     * @param {boolean} [options.shortestPath=false] - If set to true and loop enabled, will use the shortest path
     * @returns {AnimateSprite} - plugin instance
     */
    playTo(frameNumber, options){
        frameNumber = normalizeFrameNumber(frameNumber, this.#settings.frames);

        const innerPathDistance = Math.abs(frameNumber - this.#data.currentFrame), // not crossing edge frames
            outerPathDistance = this.#settings.frames - innerPathDistance, // crossing edges frames
            shouldUseOuterPath = this.#settings.loop && options?.shortestPath && (outerPathDistance < innerPathDistance);

        if ( !shouldUseOuterPath ) { // Inner path (default)
            // long conditions to make them more readable
            if (frameNumber > this.#data.currentFrame) this.setReverse(false); // move forward
            else this.setReverse(true); // move backward
        } else { // Outer path
            if (frameNumber < this.#data.currentFrame) this.setReverse(false); // move forward
            else this.setReverse(true); // move backward
        }

        return this.playFrames( (shouldUseOuterPath) ? outerPathDistance : innerPathDistance );
    }
    /**
     * Starts the animation in the current direction with the specified number of frames in queue
     * @param {number} [numberOfFrames=0] - Number of frames to play
     * @returns {AnimateSprite} - plugin instance
     */
    playFrames(numberOfFrames = 0){
        numberOfFrames = Math.floor(numberOfFrames);
        if (numberOfFrames < 0) return this.stop(); //empty animation

        this.#animation.framesLeftToPlay = numberOfFrames;
        return this.play();
    }
    /**
     * Change the direction of the animation. Alias to <b>setOption('reverse', true)</b>
     * @param {boolean} [reverse=true] True for backward animation, false for forward
     * @returns {AnimateSprite} - plugin instance
     */
    setReverse(reverse = true){
        this.#settings.reverse = !!reverse;
        return this;
    }
    /** Get current reverse option. Alias to <b>getOption('reverse')</b>
     * @returns {boolean} - reverse or not
     */
    getReverse() { return this.#settings.reverse; }
    /**
     * Calculate new dimensions (sprite element and frame), this function should be called if element size was changed by a script.
     * Called automatically after page resize
     * @returns {AnimateSprite} - plugin instance
     */
    updateSizes(){
        this.#calculateSizes();
        return this;
    }
    /**
     * Returns option value
     * @param {string} option - Option name. All options are allowed.
     * @returns {*} - Option value
     */
    getOption(option){
        const allowedOptions = getSettingsKeys();
        if (allowedOptions.includes(option)) {
            return this.#settings[option];
        } else {
            console.warn(`${option} is not allowed in getOption`);
        }
    }
    /**
     * Set new option value
     * @param {string} option - Option name. All options are allowed.
     * @param {*} value - new value
     * @returns {AnimateSprite} - plugin instance
     */
    setOption(option, value) {
        const allowedOptions = getSettingsKeys();
        if (allowedOptions.includes(option)) {
            this.#settings[option] = value;
            if ( option === "width" || option === "height" || option === "frames" || option === "cols" ) {
                this.#settings[option] = parseInt(value, 10); // additional validation
                this.#calculateSizes();
            }
            else if ( option === "frameTime" || option === "duration" || option === "fps" ) {
                this.#settings.frameTime = this.#settings.duration = this.#settings.fps = false; // Reset
                this.#settings[option] = parseInt(value, 10); // set again because of reset
                this.#animation.updateDuration();
            } else if ( option === "draggable" ) this.#toggleDrag(value);
            else if (option === 'dragModifier') this.#settings.dragModifier = Math.abs(+value);
        } else {
            console.warn(`${option} is not allowed in setOption`);
        }
        return this;
    }
    /** @returns {number} - current frame number */
    getCurrentFrame() { return this.#data.currentFrame; }
    /** @returns {boolean} - animating or not */
    isAnimating() { return this.#animation.isAnimating; }
    /**
     * Stop the animation and return to the first frame
     * @returns @returns {AnimateSprite} - plugin instance
     */
    reset(){
        this.stop();
        this.#changeFrame( normalizeFrameNumber(1, this.#settings.frames) );
        return this;
    }
    /**
     * Stop animation, remove event listeners. Method doesn't remove sprite element from the DOM
     */
    destroy() {
        this.stop();
        this.#toggleDrag(false);
        this.#toggleResizeHandler(false);
    }

}

// todo can't import typedef from another file because it won't add type to d.ts, check this in the future

/**
 * @typedef {object} PluginOptions
 * @property {number} width - Width of one frame in sprite
 * @property {number} height - Height of one frame in sprite
 * @property {number} frames - Number of frames
 * @property {number|false} [cols=false] - Number of cols if more than 1 row
 * @property {boolean} [loop=false] - Whether to loop the animation
 * @property {boolean} [autoplay=false] - Autoplay
 * @property {number|false} [frameTime] - ms, time between frames
 * @property {number|false} [duration] - ms, total time, alternative to frameTime
 * @property {number|false} [fps=24] - fps, alternative to frameTime
 * @property {boolean} [reverse=false] - Reverse direction of animation
 * @property {number|boolean} [draggable=false] - Draggable by mouse or touch
 * @property {boolean} [inversion=false] - Inversion changes drag direction
 * @property {number} [dragModifier=1] - Sensitivity factor for user interaction. Only positive numbers are allowed
 * @property {'pageScrollTimer' | 'preventPageScroll' | 'allowPageScroll'} [touchScrollMode="pageScrollTimer"]
 * - Page scroll behavior with touch events (preventPageScroll,allowPageScroll, pageScrollTimer)
 * @property {number} [pageScrollTimerDelay=1500] - Time in ms when touch scroll will be disabled during interaction
 * if options.touchScrollMode = "pageScrollTimer"
 * @property {function(AnimateSprite):void} [onAnimationEnd] - Occurs when animation has ended
 * @property {function(AnimateSprite):void} [onAfterFrameChange] - Occurs after the frame has switched
 */

