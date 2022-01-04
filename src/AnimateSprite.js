import { validateParameters, getSettings } from "./settings";
import { normalizeFrameNumber } from "./utils";
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
 * var sprite = new AnimateSprite( document.getElementById('sprite'),
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
        currentFrame: 1,//main. drag, animation
        nodeWidth: null,//drag
        nodeHeight: null,//drag
        element: null, //drag
        pluginApi: {}// drag, animation
    }
    // Classes
    #dragInput;
    #animation;

    constructor( node, options = {} ) {
        validateParameters(node, options);
        this.#settings = getSettings(node, options);
        this.#data.element = node;
        this.#data.pluginApi = this;
        this.initPlugin();
    }

    initPlugin(){
        this.#animation = new Animation(
            {settings: this.#settings, data: this.#data, changeFrame: this.#changeFrame.bind(this)} );
        this.#calculateSizes();
        addResizeHandler(this.#calculateSizes.bind(this));

        if ( this.#settings.autoplay ) this.play();
        if ( this.#settings.draggable ) this.#toggleDrag(true);
    }

    // Private functions
    #animateSprite(frame) {
        this.#data.element.style.backgroundPosition = this.#calculatePosition(frame);
    }
    #changeFrame(frameNumber){
        if (frameNumber === this.#data.currentFrame) return;//skip same frame
        this.#animateSprite(frameNumber);
        this.#data.currentFrame = frameNumber;
    }

    #calculatePosition(frame){
        let xPadding,
            yPadding = 0;
        if ( !this.#settings.cols ){ // Single row sprite
            xPadding = (frame - 1) * this.#data.nodeWidth;
        } else { // Multiline sprite
            xPadding = ( ( (frame - 1) % this.#settings.cols)  ) * this.#data.nodeWidth;
            yPadding = Math.floor( (frame - 1) / this.#settings.cols ) * this.#data.nodeHeight;
        }
        return `-${xPadding}px -${yPadding}px`;
    }

    #calculateSizes(){
        const wasAnimating = this.#animation.isAnimating;
        this.stop();
        let widthHeightRatio = this.#settings.width / this.#settings.height;
        this.#data.nodeWidth = this.#data.element.offsetWidth;
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

    // Public API'

    play(){
        if ( this.#animation.isAnimating ) return;
        this.#animation.play();
        return this;
    }
    stop(){
        this.#animation.stop();
        return this;
    }
    toggle(){
        if ( !this.#animation.isAnimating ) this.play();
        else this.stop();
        return this;
    }
    next(){
        this.stop();
        this.#changeFrame( this.#animation.getNextFrame(1) );
        return this;
    }
    prev(){
        this.stop();
        this.#changeFrame( this.#animation.getNextFrame(1, !this.#settings.reverse) );
        return this;
    }
    reset(){
        this.stop();
        this.#changeFrame(normalizeFrameNumber(1, this.#settings.frames));
        return this;
    }
    setFrame(frameNumber){
        this.stop();
        this.#changeFrame(normalizeFrameNumber(frameNumber, this.#settings.frames));
        return this;
    }
    setReverse(reverse = true){
        this.#settings.reverse = !!reverse;
        return this;
    }
    getCurrentFrame() { return this.#data.currentFrame; }
    isAnimating() { return this.#animation.isAnimating; }
    setOption(option, value) {
        if ( option === "frameTime" || option === "duration" || option === "fps" ) {
            this.#settings.frameTime = this.#settings.duration = this.#settings.fps = false; // Reset
            this.#settings[option] = +value;
            this.#animation.updateDuration();
            if ( this.#animation.isAnimating ) {
                this.stop();
                this.play();
            }
        }
        return this;
    }
    destroy() {
        this.stop();
        this.#toggleDrag(false);
        removeResizeHandler( this.#calculateSizes.bind(this) );
    }
}


function addResizeHandler(cb) {
    window.addEventListener("resize", cb); // todo add debouncing
}
function removeResizeHandler(cb) {
    window.removeEventListener("resize", cb);
}


