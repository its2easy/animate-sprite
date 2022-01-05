import {validateParameters, getSettings, getSettingsKeys} from "./settings";
import { normalizeFrameNumber } from "./utils";
import DragInput from "./DragInput";
import Animation from "./Animation";

/**
 * @param {Element|HTMLElement} node - DOM Node
 * @param {Object} options - Options
 * @param {Number} options.width - Width of one frame in sprite
 * @param {Number} options.height - Height of one frame in sprite
 * @param {Number} options.frames - Number of frames
 * @param {Number|Boolean} [options.cols=false] - Number of cols if more than 1 row
 * @param {Boolean} [options.loop=false] - Whether to loop the animation
 * @param {Boolean} [options.autoplay=false] - Autoplay
 * @param {Number|Boolean} [options.frameTime] - ms, time between frames
 * @param {Number|Boolean} [options.duration] - ms, total time, alternative to frameTime
 * @param {Number|Boolean} [options.fps=24] - fps, alternative to frameTime
 * @param {Boolean} [options.reverse=false] - Reverse direction of animation
 * @param {Boolean} [options.inversion=false] - Inversion defines base direction. It differs from reverse in that
 * reverse means forward or backward, and inversion determines which direction is forward. Affects animation and drag
 * @param {Number|Boolean} [options.draggable=false] - Draggable by mouse or touch
 * @param {String} [options.touchScrollMode="pageScrollTimer"] - Page scroll behavior with touch events
 * (preventPageScroll,allowPageScroll, pageScrollTimer)
 * @param {Number} [options.pageScrollTimerDelay=1500] - Time in ms when touch scroll will be disabled during interaction
 * if options.touchScrollMode = "pageScrollTimer"
 * @returns {Object}
 * @example
 *
 * let sprite = new AnimateSprite( document.getElementById('sprite'),
 *     {
 *         width: 720,
 *         height: 405,
 *         cols: 5,
 *         frames: 20,
 *         frameTime: 45,
 *         loop: true
 *     }
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

    constructor( node, options = {} ) {
        validateParameters(node, options);
        this.#settings = getSettings(node, options);
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
     * Show the previous frame
     * @returns {AnimateSprite} - plugin instance
     */
    prev(){
        this.stop();
        this.#changeFrame( this.#animation.getNextFrame(1, !this.#settings.reverse) );
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
     * Set frame (without animation)
     * @param {Number} frameNumber - Number of the frame to show
     * @returns {AnimateSprite} - plugin instance
     */
    setFrame(frameNumber){
        this.stop();
        this.#changeFrame( normalizeFrameNumber(frameNumber, this.#settings.frames) );
        return this;
    }
    /**
     * Starts the animation, that plays until the specified frame number
     * @param {Number} frameNumber - Target frame number
     * @returns {AnimateSprite} - plugin instance
     */
    playTo(frameNumber){
        frameNumber = normalizeFrameNumber(frameNumber, this.#settings.frames);
        if (frameNumber > this.#data.currentFrame)   this.setReverse(false); // move forward
        else  this.setReverse(true); // move backward

        return this.playFrames(Math.abs(frameNumber - this.#data.currentFrame))
    }
    /**
     * Starts the animation in the current direction with the specified number of frames in queue
     * @param {Number} [numberOfFrames=0] - Number of frames to play
     * @returns {AnimateSprite} - plugin instance
     */
    playFrames(numberOfFrames = 0){
        numberOfFrames = Math.floor(numberOfFrames);
        if (numberOfFrames < 0) return this; //empty animation

        this.#animation.framesLeftToPlay = numberOfFrames;
        return this.play();
    }
    /**
     * Change the direction of the animation
     * @param {Boolean} reverse
     * @returns {AnimateSprite} - plugin instance
     */
    setReverse(reverse = true){
        this.#settings.reverse = !!reverse;
        return this;
    }
    /**
     * Calculate new sprite and frame dimensions, should be called if element size was changes manually. Called automatically after resize
     * @returns {AnimateSprite} - plugin instance
     */
    updateSizes(){
        this.#calculateSizes();
        return this;
    }
    getCurrentFrame() { return this.#data.currentFrame; }
    isAnimating() { return this.#animation.isAnimating; }
    getReverse() { return this.#settings.reverse; }
    /**
     * Returns option value
     * @param {String} option - Option name. All options are allowed.
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
     * @param {String} option - Option name. All options are allowed.
     * @param {String|Number|Boolean} value - new value
     * @returns {AnimateSprite} - plugin instance
     */
    setOption(option, value) {
        const allowedOptions = getSettingsKeys();
        if (allowedOptions.includes(option)) {
            this.#settings[option] = value;
            if ( option === "width" || option === "height" || option === "frames" || option === "cols" ) {
                this.#calculateSizes();
            }
            else if ( option === "frameTime" || option === "duration" || option === "fps" ) {
                this.#settings.frameTime = this.#settings.duration = this.#settings.fps = false; // Reset
                this.#animation.updateDuration();
            } else if ( option === "draggable" ) {
                this.#toggleDrag(value);
            }
        } else {
            console.warn(`${option} is not allowed in setOption`);
        }
        return this;
    }
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


