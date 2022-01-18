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
        this.#lastUpdate = performance.now();
        requestAnimationFrame(this.#boundAnimate);
    }
    stop(){
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
                // ex. newFrame = -2, total = 50, newFrame = 50 - abs(-2) = 48
                newFrameNumber = this.#settings.frames - Math.abs(newFrameNumber);
            }
            else if (newFrameNumber > this.#settings.frames) {
                //ex. newFrame = 53, total 50, newFrame = newFrame - totalFrames = 53 - 50 = 3
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
    #animate(time){
        if ( !this.isAnimating ) return; //stop() was called before this RAF

        const progress = ( time - this.#lastUpdate ) / this.#duration; // ex. 0.01
        let deltaFrames = progress * this.#settings.frames; // Ex. 0.45 or 1.25

        if ( deltaFrames >= 1) { // Animate only if we need to update 1 frame or more
            // calculate next frame only when we want to render
            // if the getNextFrame check was outside, getNextFrame would be called at screen fps rate, not animation fps
            // if screen fps 144 and animation fps 30, getNextFrame is calling now 30/sec instead of 144/sec,
            // so after the last frame, raf is repeating until the next frame calculation
            // Between the last frame drawing and new frame time, reverse or loop could be changed, and animation won't stop
            deltaFrames = Math.floor(deltaFrames) % this.#settings.frames;
            if ( deltaFrames > this.framesLeftToPlay ) deltaFrames = this.framesLeftToPlay;// case when screen fps higher than animation fps
            const newFrame = this.getNextFrame( deltaFrames );
            if ( this.#stopRequested ) { // animation ended in getNextFrame() check
                this.#data.pluginApi.stop();
                this.#stopRequested = false;
            } else { // animation on
                this.#lastUpdate = time;
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
