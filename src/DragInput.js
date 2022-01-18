export default class DragInput{
    static SWIPE_EVENTS = ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend', 'touchcancel'];
    data;
    settings;
    changeFrame;
    getNextFrame;
    boundSwipeHandler;

    curX;
    curY;
    prevX;
    prevY;
    isSwiping = false;
    threshold;
    pixelsCorrection = 0;
    lastInteractionTime;

    constructor({ data, settings, changeFrame, getNextFrame }) {
        this.data = data;
        this.settings = settings;
        this.changeFrame = changeFrame;
        this.getNextFrame = getNextFrame;
        this.boundSwipeHandler = this.#swipeHandler.bind(this);
        this.updateThreshold();
    }

    enableDrag(){
        DragInput.SWIPE_EVENTS.forEach( (value) => {
            this.data.element.addEventListener(value, this.boundSwipeHandler);
        });
    }
    disableDrag(){
        DragInput.SWIPE_EVENTS.forEach( (value) => {
            this.data.element.removeEventListener(value, this.boundSwipeHandler);
        });
        this.#toggleDocumentEventHandlers(false);
        this.data.element.style.cursor = null;
    }

    /**
     * Update one frame threshold in pixels, based on block width, should be called after nodeWidth change
     * @param newValue
     */
    updateThreshold(newValue = null){
        if (newValue) {
            this.threshold = newValue;
        }
        else {
            this.threshold = this.data.nodeWidth / this.settings.frames;
        }
    }
    #swipeHandler(event) {
        let touches;
        if ( event.touches !== undefined && event.touches.length ) touches = event.touches;
        this.curX = (touches) ? touches[0].pageX : event.clientX;
        this.curY = (touches) ? touches[0].pageY : event.clientY;

        switch (event.type){
            case 'mousedown':
            case 'touchstart':
                if ( event.type === 'touchstart' && event.cancelable) this.#maybeDisableScroll(event);
                this.#toggleDocumentEventHandlers(true);
                this.#swipeStart();
                break;
            case 'mousemove':
            case 'touchmove':
                if ( this.isSwiping ) this.#swipeMove();
                break;
            case 'mouseup':
            case 'touchend':
            case 'touchcancel':
                //if ( (event.type === 'touchend' || event.type === 'touchcancel') && event.cancelable) event.preventDefault();
                this.#toggleDocumentEventHandlers(false);
                this.#swipeEnd();
                break;
        }
    }
    #swipeStart(){
        this.data.pluginApi.stop();
        this.isSwiping = true;
        this.data.element.style.cursor = 'grabbing';
        this.prevX = this.curX;
        this.prevY = this.curY;
        this.data.element.dispatchEvent(new CustomEvent('sprite:drag-start',
            {detail: {frame: this.data.currentFrame}}
        ));
    }
    #swipeMove(){
        const direction = this.#swipeDirection();
        const swipeLength = Math.round( Math.abs(this.curX - this.prevX) * this.settings.dragModifier ) + this.pixelsCorrection;

        if ( swipeLength <= this.threshold) return; // Ignore if pixels are less than 1 frame
        if ( direction !== 'left' && direction !== 'right') return; // Ignore vertical directions

        this.prevX = this.curX;
        this.prevY = this.curY;

        const progress = swipeLength / this.data.nodeWidth;
        let deltaFrames = Math.floor(progress * this.settings.frames);
        deltaFrames = deltaFrames % this.settings.frames;
        // Add pixels to the next swipeMove if frames equivalent of swipe is not an integer number,
        // e.g one frame is 10px, swipeLength is 13px, we change 1 frame and add 3px to the next swipe,
        // so fullwidth swipe is always rotate sprite for 1 turn / all frames (with 'dragModifier' = 1)
        this.pixelsCorrection = swipeLength - (this.threshold * deltaFrames);
        this.changeFrame(this.getNextFrame( deltaFrames, (direction === 'left') ));// left means backward (reverse: true)
        this.data.element.dispatchEvent(new CustomEvent('sprite:drag-change',
            {detail: {frame: this.data.currentFrame}}
        ));
    }
    #swipeEnd(){
        this.curX = this.curY = this.prevX = this.prevY = null;
        this.isSwiping = false;
        this.data.element.style.cursor = null;
        this.lastInteractionTime = new Date().getTime();
        this.data.element.dispatchEvent(new CustomEvent('sprite:drag-end',
            {detail: {frame: this.data.currentFrame}}
        ));
    }
    #swipeDirection(){
        let xDist, yDist, r, swipeAngle;
        xDist = this.prevX - this.curX;
        yDist = this.prevY - this.curY;
        r = Math.atan2(yDist, xDist);
        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) swipeAngle = 360 - Math.abs(swipeAngle);
        if ( (swipeAngle >= 0 && swipeAngle <= 60) || (swipeAngle <= 360 && swipeAngle >= 300 )) return 'left';
        else if ( swipeAngle >= 120 && swipeAngle <= 240 ) return 'right';
        else if ( swipeAngle >= 241 && swipeAngle <= 299 ) return 'bottom';
        else return 'up';
    }
    /**
     * Idea from https://github.com/giniedp/spritespin/blob/master/src/plugins/input-drag.ts#L45
     * @param {Event} event
     */
    #maybeDisableScroll(event){
        // always prevent
        if (this.settings.touchScrollMode === "preventPageScroll") event.preventDefault();
        // check timer
        if (this.settings.touchScrollMode === "pageScrollTimer") {
            let now = new Date().getTime();
            // less time than delay => prevent page scroll
            if (this.lastInteractionTime && (now - this.lastInteractionTime < this.settings.pageScrollTimerDelay) ){
                event.preventDefault();
            } else { // more time than delay or first interaction => clear timer
                this.lastInteractionTime = null;
            }
        }
        // if touchScrollMode="allowPageScroll" => don't prevent scroll, so no action is needed
    }

    /**
     * Events to continue dragging if cursor is outside of the sprite block
     * @param {boolean} add
     */
    #toggleDocumentEventHandlers(add = true){
        if ( add ) {
            document.addEventListener('mouseup', this.boundSwipeHandler);
            document.addEventListener('mousemove', this.boundSwipeHandler);
        } else {
            document.removeEventListener('mouseup', this.boundSwipeHandler);
            document.removeEventListener('mousemove', this.boundSwipeHandler);
        }
    }
}
