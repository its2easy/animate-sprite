export default class Animation{
    #settings;
    #data;
    #changeFrame;

    isAnimating = false;
    framesLeftToPlay = undefined; // frames from playTo() and playFrames()

    #boundAnimate;
    #lastUpdate; // time from RAF
    #duration; // time of the full animation sequence
    #stopRequested = false;

    framesQueue = 0; // save decimal part if deltaFrames is not round, to prevent rounding errors
    progressThreshold = 0.35; // >35% means that there was a long task in callstack

    constructor( {settings, data, changeFrame} ) {
        this.#settings = settings;
        this.#data = data;
        this.#changeFrame = changeFrame;
        this.#boundAnimate = this.#animate.bind(this);
        this.updateDuration();
    }

    play(){
        this.isAnimating = true;
        this.#stopRequested = false; // fix for the case when stopRequested was set inside getNextFrame that was called outside #animate
        this.#lastUpdate = null;// first 'lastUpdate' should be always set in the first raf of the current animation
        requestAnimationFrame(this.#boundAnimate);
    }
    stop(){
        if ( this.isAnimating ){
            this.#data.element.dispatchEvent( new Event('sprite:animation-end') );
            if ( this.#settings.onAnimationEnd ) this.#settings.onAnimationEnd(this.#data.pluginApi);
        }
        this.isAnimating = false;
        this.framesLeftToPlay = undefined;
    }
    getNextFrame(deltaFrames, reverse = undefined){
        deltaFrames = Math.floor(deltaFrames); //just to be safe
        // Handle reverse and inversion
        if ( reverse === undefined ) reverse = this.#settings.reverse;

        let newFrameNumber = (reverse === this.#settings.inversion) // true&&true and false&false mean usual direction (1..last)
            ? this.#data.currentFrame + deltaFrames
            : this.#data.currentFrame - deltaFrames;

        // Handle loop
        if (this.#settings.loop) { // loop and outside of the frames
            if (newFrameNumber <= 0) {
                // for example newFrame = -2, total = 50, newFrame = 50 - abs(-2) = 48
                newFrameNumber = this.#settings.frames - Math.abs(newFrameNumber);
            }
            else if (newFrameNumber > this.#settings.frames) {
                // for example newFrame = 53, total 50, newFrame = newFrame - totalFrames = 53 - 50 = 3
                newFrameNumber = newFrameNumber - this.#settings.frames;
            }
        } else { // no loop and outside of the frames
            if (newFrameNumber <= 0) {
                newFrameNumber = 1;
                this.#stopRequested = true;
            }
            else if (newFrameNumber > this.#settings.frames) {
                newFrameNumber = this.#settings.frames;
                this.#stopRequested = true;
            }
        }

        return  newFrameNumber;
    }

    // RAF callback
    // (chrome) 'timestamp' is timestamp from the moment the RAF callback was queued
    // (firefox) 'timestamp' is timestamp from the moment the RAF callback was called
    // the difference is equal to the time that the main thread was executing after raf callback was queued
    #animate(timestamp){
        if ( !this.isAnimating ) return; //stop() was called before this RAF

        // lastUpdate is setting here because the time between play() and #animate() is unpredictable, and
        // lastUpdate = performance.now() instead of timestamp because timestamp is unpredictable and depends on the browser.
        // Possible frame change in the first raf will always be skipped, because time <= performance.now
        if ( !this.#lastUpdate) this.#lastUpdate = performance.now();

        let deltaFrames;
        // Check if there was a long task between this and the last frame, if so move 1 fixed frame and change lastUpdate to now
        // to prevent animation jump. (1,2,3,long task,75,76,77, ... => 1,2,3,long task,4,5,6,...)
        // In this case the duration will be longer
        let isLongTaskBeforeRaf = (Math.abs(timestamp - performance.now()) / this.#duration) > this.progressThreshold; //chrome check
        let progress = ( timestamp - this.#lastUpdate ) / this.#duration; // ex. 0.01
        if ( progress > this.progressThreshold ) isLongTaskBeforeRaf = true; // firefox check

        if (isLongTaskBeforeRaf) deltaFrames = 1; // raf after long task, just move to the next frame
        else { // normal execution, calculate progress after the last frame change
            if (progress < 0) progress = 0; //it happens sometimes, when raf timestamp is from the past for some reason
            deltaFrames = progress * this.#settings.frames; // Ex. 0.45 or 1.25
            // e.g. progress is 0.8 frames, queue is 0.25 frames, so now deltaFrames is 1.05 frames and we need to update canvas,
            // without this raf intervals will cause cumulative rounding errors, and actual fps will decrease
            deltaFrames = deltaFrames + this.framesQueue;
        }

        // calculate next frame only when we want to render
        // if the getNextFrame check was outside, getNextFrame would be called at screen fps rate, not animation fps
        // if screen fps 144 and animation fps 30, getNextFrame is calling now 30/s instead of 144/s.
        // After the last frame, raf is repeating until the next frame calculation,
        // between the last frame drawing and new frame time, reverse or loop could be changed, and animation won't stop
        if ( deltaFrames >= 1) { // Calculate only if we need to update 1 frame or more
            const newLastUpdate = isLongTaskBeforeRaf ? performance.now() : timestamp;

            this.framesQueue = deltaFrames % 1; // save decimal part for the next RAFs
            deltaFrames = Math.floor(deltaFrames) % this.#settings.frames;
            if ( deltaFrames > this.framesLeftToPlay ) deltaFrames = this.framesLeftToPlay;// case when  animation fps > device fps
            const newFrame = this.getNextFrame( deltaFrames );
            if ( this.#stopRequested ) { // animation ended from check in getNextFrame()
                this.#data.pluginApi.stop();
                this.#stopRequested = false;
                if (this.#data.pluginApi.getCurrentFrame() !== newFrame ) this.#changeFrame(newFrame); //last frame fix if fps > device fps
            } else { // animation is on
                this.#lastUpdate = newLastUpdate;
                this.#changeFrame(newFrame);
                if (typeof this.framesLeftToPlay !== 'undefined') {
                    this.framesLeftToPlay = this.framesLeftToPlay - deltaFrames;
                    // if 0 frames left, stop immediately, don't wait for the next frame calculation
                    // because if isAnimating become true, this will be a new animation
                    if ( this.framesLeftToPlay <= 0 ) this.#data.pluginApi.stop();
                }
            }
        }
        if ( this.isAnimating ) requestAnimationFrame(this.#boundAnimate);
    }
    updateDuration(){
        this.#duration = this.#calculateDuration();
    }
    #calculateDuration(){
        if (this.#settings.frameTime) return this.#settings.frameTime * this.#settings.frames; // frameTime
        else if (this.#settings.duration) return this.#settings.duration; // duration
        else return  ( this.#settings.frames / this.#settings.fps ) * 1000; // fps
    }
}
