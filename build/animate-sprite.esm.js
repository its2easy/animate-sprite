/*!
 @its2easy/animate-sprite 1.1.1
 https://github.com/its2easy/animate-sprite
         
 Copyright (c) 2020 Dmitry Kovalev,
 Released under the MIT license
*/
/**
 * Object.assign polyfill
 *
 * @param {Object} target
 * @param {Object} firstSource
 * @returns {Object}
 */
function mergeObjects(target, firstSource) {
    if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
    }

    var to = Object(target);
    for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
            continue;
        }

        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
            var nextKey = keysArray[nextIndex];
            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
            if (desc !== undefined && desc.enumerable) {
                to[nextKey] = nextSource[nextKey];
            }
        }
    }
    return to;
}

/**
 *
 * @param {HTMLElement} node - DOM Node
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
 *              }readme.md
 */
function init(node, options = {}) {
    if ( !(node instanceof HTMLElement || node instanceof Element || node instanceof HTMLDocument)) {
        throw new TypeError('Node is required');
    }

    // Setup settings
    let inlineSettings = fillInlineSettings( node,
        ['width', 'height', 'frames', 'cols', 'loop', 'frameTime', 'duration', 'fps', 'reverse', 'autoplay', 'draggable']
    );

    let defaultSettings = {
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
        draggable: false
    };
    //let settings = Object.assign(defaultSettings, options, inlineSettings);
    let settings = mergeObjects(defaultSettings, options, inlineSettings);

    let currentFrame = 1,
        isAnimating = false,
        duration, // One animation cycle duration
        lastUpdate,
        isSwiping = false,
        swipeObject = {},
        swipeThreshold,
        swipePixelsCorrection = 0,
        nodeWidth,
        nodeHeight,
        widthHeightRatio,
        bgWidth,
        bgHeight,
        plugin = {}; // Public object

    const swipeEvents = ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend', 'touchcancel'];

    // Private functions
    function animateSprite(frame) {
        node.style.backgroundPosition = calculatePosition(frame);
    }
    function changeFrame(frame){
        if ( frame === currentFrame ) return;
        if ( !isOutOfRange(frame) ){ // Valid frame
            animateSprite(frame);
            checkForEvents(currentFrame, frame);
            currentFrame = frame;
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
        return  (reverse) ? currentFrame - deltaFrames : currentFrame + deltaFrames;
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
            xPadding = ( ( (frame - 1) % settings.cols)  ) * nodeWidth;
            yPadding = Math.floor( (frame - 1) / settings.cols ) * nodeHeight;
        }
        return `-${xPadding}px -${yPadding}px`;
    }
    function calculateDuration(frameTime, duration, fps){
        if (frameTime) return frameTime * settings.frames;
        else if (duration) return duration;
        else return  ( settings.frames / fps ) * 1000;
    }
    function animate(time){
        const progress = ( time - lastUpdate ) / duration;
        //console.log(time - lastUpdate);
        const deltaFrames = progress * settings.frames; // Ex. 0.45 or 1.25
        // A place for timing function

        if ( deltaFrames >= 1) { // Animate only if we need to update 1 frame or more
            changeFrame(getNextFrame( Math.floor(deltaFrames) ));
            lastUpdate = performance.now();
        }
        if ( isAnimating ) requestAnimationFrame(animate);
    }

    function calculateSizes(){
        plugin.stop();
        widthHeightRatio = settings.width / settings.height;
        nodeWidth = node.offsetWidth;
        nodeHeight = nodeWidth / widthHeightRatio;
        node.style.height = nodeHeight + "px";
        swipeThreshold = nodeWidth / settings.frames;
        bgWidth =  ( !settings.cols )
            ? settings.frames * nodeWidth
            : settings.cols * nodeWidth;
        bgHeight = ( !settings.cols )
            ? nodeHeight
            : Math.ceil( settings.frames / settings.cols ) * nodeHeight;
        node.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
        changeFrame(1);
    }
    function checkForEvents(prevFrame, nextFrame) {
        if ( (prevFrame === settings.frames - 1) && (nextFrame === settings.frames) ){
            node.dispatchEvent( new Event('sprite:last-frame') );
        } else if ( (prevFrame === 2) && (nextFrame === 1) ) {
            node.dispatchEvent( new Event('sprite:first-frame') );
        }
    }
    function initPlugin(){
        duration = calculateDuration(settings.frameTime, settings.duration, settings.fps);
        lastUpdate = performance.now();

        calculateSizes();
        addResizeHandler(calculateSizes);

        if ( settings.autoplay ) plugin.play();
        if ( settings.draggable ) {
            setupSwipeEvents(node, swipeHandler, swipeEvents);
            node.style.cursor = 'grab';
        }
    }

    //===================== SWIPE ROTATION ====================//
    function swipeHandler(event){
        let touches;
        if ( event.touches !== undefined && event.touches.length ) touches = event.touches;
        swipeObject.curX = (touches) ? touches[0].pageX : event.clientX;
        swipeObject.curY = (touches) ? touches[0].pageY : event.clientY;

        switch (event.type){
            case 'mousedown':
            case 'touchstart':
                if ( event.type === 'touchstart') event.preventDefault();
                document.addEventListener('mouseup', swipeHandler);
                document.addEventListener('mousemove', swipeHandler);
                swipeStart();
                break;
            case 'mousemove':
            case 'touchmove':
                if ( event.type === 'touchmove') event.preventDefault();
                if ( isSwiping ) swipeMove();
                break;
            case 'mouseup':
            case 'touchend':
            case 'touchcancel':
                if ( event.type === 'touchend' || event.type === 'touchcancel') event.preventDefault();
                document.removeEventListener('mouseup', swipeHandler);
                document.removeEventListener('mousemove', swipeHandler);
                swipeEnd();
                break;
        }
    }
    function swipeStart(){
        isAnimating = false;
        isSwiping = true;
        node.style.cursor = 'grabbing';
        document.body.style.cursor = 'grabbing';
        swipeObject.prevX = swipeObject.curX;
        swipeObject.prevY = swipeObject.curY;
    }
    function swipeMove(){
        const direction = swipeDirection();
        swipeObject.prevY = swipeObject.curY; // Update Y to get right angle

        const swipeLength = Math.round( Math.abs(swipeObject.curX - swipeObject.prevX) ) + swipePixelsCorrection;
        if ( swipeLength <= swipeThreshold) return; // Ignore if less than 1 frame
        if ( direction !== 'left' && direction !== 'right') return; // Ignore vertical directions
        swipeObject.prevX = swipeObject.curX;

        const progress = swipeLength / nodeWidth;
        const deltaFrames = Math.floor(progress * settings.frames);
        // Add pixels to the next swipeMove if frames equivalent of swipe is not an integer number,
        // e.g one frame is 10px, swipeLength is 13px, we change 1 frame and add 3px to the next swipe,
        // so fullwidth swipe is always rotate sprite for 1 turn
        swipePixelsCorrection = swipeLength - (swipeThreshold * deltaFrames);
        changeFrame(getNextFrame( deltaFrames, (direction !== 'left') ));
    }
    function swipeEnd(){
        //if ( swipeObject.curX === undefined ) return; // there is no x coord on touch end
        swipeObject = {};
        isSwiping = false;
        node.style.cursor = 'grab';
        document.body.style.cursor = 'default';
    }
    function swipeDirection(){
        let xDist, yDist, r, swipeAngle;
        xDist = swipeObject.prevX - swipeObject.curX;
        yDist = swipeObject.prevY - swipeObject.curY;
        r = Math.atan2(yDist, xDist);
        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) swipeAngle = 360 - Math.abs(swipeAngle);
        if ( (swipeAngle >= 0 && swipeAngle <= 60) || (swipeAngle <= 360 && swipeAngle >= 300 )) return 'left';
        else if ( swipeAngle >= 120 && swipeAngle <= 240 ) return 'right';
        else if ( swipeAngle >= 241 && swipeAngle <= 299 ) return 'bottom';
        else return 'up';
    }
    //===================== END SWIPE ====================//

    // Public API
    plugin.play = function(){
        if ( isAnimating ) return;
        isAnimating = true;
        lastUpdate = performance.now();
        requestAnimationFrame(animate);
        return this;
    };
    plugin.stop = function(){
        isAnimating = false;
        return this;
    };
    plugin.toggle = function(){
        if ( !isAnimating ) plugin.play();
        else plugin.stop();
        return this;
    };
    plugin.next = function(){
        plugin.stop();
        changeFrame( currentFrame + 1 );
        return this;
    };
    plugin.prev = function(){
        plugin.stop();
        changeFrame( currentFrame - 1 );
        return this;
    };
    plugin.reset = function(){
        plugin.stop();
        changeFrame(1);
        return this;
    };
    plugin.setFrame = function(frame){
        plugin.stop();
        changeFrame(frame);
        return this;
    };
    plugin.setReverse = function(reverse = true){
        settings.reverse = !!reverse;
        return this;
    };
    plugin.getCurrentFrame = () => currentFrame;
    plugin.isAnimating = () => isAnimating;
    plugin.setOption = function (option, value) {
        if ( option === "frameTime" || option === "duration" || option === "fps" ) {
            settings.frameTime = settings.duration = settings.fps = false; // Reset
            settings[option] = +value;
            duration = calculateDuration(settings.frameTime, settings.duration, settings.fps); // Recalculate
            if ( isAnimating ) {
                plugin.stop();
                plugin.play();
            }
        }
        return this;
    };
    plugin.destroy = function () {
        removeSwipeEvents( node, swipeHandler, swipeEvents );
        removeResizeHandler( calculateSizes );
    };

    initPlugin();
    return plugin;
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

function addResizeHandler(cb) {
    window.addEventListener("resize", cb); // todo add debouncing
}
function removeResizeHandler(cb) {
    window.removeEventListener("resize", cb);
}

function setupSwipeEvents(node, swipeHandler, swipeEvents) {
    swipeEvents.forEach( (value) => {
        node.addEventListener(value, swipeHandler);
    });
}
function removeSwipeEvents(node, swipeHandler, swipeEvents) {
    swipeEvents.forEach( (value) => {
        node.removeEventListener(value, swipeHandler);
    });
}

export { init };
//# sourceMappingURL=animate-sprite.esm.js.map
