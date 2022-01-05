document.addEventListener("DOMContentLoaded", function() {
    // First example
    let element = document.getElementById('sprite1');
    let sprite1 = new AnimateSprite(element,
        {
            width: 600,
            height: 350,
            cols: 13,
            frames: 60,
            //frameTime: 45,
            //duration: 1000,
            fps: 45,
            loop: true,
            draggable: true,
            //touchScrollMode: "pageScrollTimer"
        }
    );
    setupControls(sprite1);
    setupEvents(element);
    //sprite1.setFrame(30).setReverse(true).playTo(45);

    // Controls
    function setupControls(sprite){
        let playBtn = document.querySelector(".js-play"),
            stopBtn = document.querySelector(".js-stop"),
            toggleBtn = document.querySelector(".js-toggle"),
            nextBtn = document.querySelector(".js-next"),
            prevBtn = document.querySelector(".js-prev"),
            resetBtn = document.querySelector(".js-reset"),
            reverseBtn = document.querySelector(".js-reverse"),
            framesInput = document.querySelector(".js-frames-input"),
            setFrameBtn = document.querySelector(".js-set-frame"),
            setDurationBtn = document.querySelector(".js-set-duration"),
            setFrameTimeBtn = document.querySelector(".js-set-frame-time"),
            setFpsBtn = document.querySelector(".js-set-fps");

        playBtn.addEventListener('click', () => { sprite.play(); });
        stopBtn.addEventListener('click', () => { sprite.stop(); });
        toggleBtn.addEventListener('click', () => { sprite.toggle(); });
        nextBtn.addEventListener('click', () => { sprite.next(); });
        prevBtn.addEventListener('click', () => { sprite.prev(); });
        resetBtn.addEventListener('click', () => { sprite.reset(); });

        let reverse = false;
        reverseBtn.addEventListener('click', () => {
            reverse = !reverse;
            sprite.setReverse(reverse);
        });
        framesInput.addEventListener('input', function() { sprite.setFrame(this.value); });

        // Inputs
        setFrameBtn.addEventListener('click', function() {
            sprite.setFrame( this.closest('.js-option-block').querySelector('input').value );
        });
        setDurationBtn.addEventListener('click', function() {
            sprite.setOption( 'duration', this.closest('.js-option-block').querySelector('input').value );
        });
        setFrameTimeBtn.addEventListener('click', function() {
            sprite.setOption( 'frameTime', this.closest('.js-option-block').querySelector('input').value );
        });
        setFpsBtn.addEventListener('click', function() {
            sprite.setOption( 'fps', this.closest('.js-option-block').querySelector('input').value );
        });
    }

    function setupEvents(element){
        element.addEventListener('sprite:last-frame', function () {
            console.log('last frame');
        });
        element.addEventListener('sprite:first-frame', function () {
            console.log('first frame');
        });
        element.addEventListener('sprite:drag-start', function () {
            console.log('sprite:drag-start');
        });
        element.addEventListener('sprite:drag-change', function () {
            console.log('sprite:drag-change');
        });
        element.addEventListener('sprite:drag-end', function () {
            console.log('sprite:drag-end');
        });
    }

    // Second example
    // let element2 = document.getElementById('sprite2');
    // let sprite2 = animateSprite.init(element2,
    //     {
    //         width: 600,
    //         height: 350,
    //         cols: 13,
    //         frames: 61,
    //         duration: 1000,
    //         loop: false,
    //     }
    // );
    // element2.addEventListener('mouseenter', () => {
    //     sprite2.setReverse(false).play();
    // });
    // element2.addEventListener('mouseleave', () => {
    //     sprite2.setReverse(true).play();
    // });
});

