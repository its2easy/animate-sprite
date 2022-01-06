document.addEventListener("DOMContentLoaded", function() {
    // First example
    let element = document.getElementById('sprite1');
    let sprite1 = new AnimateSprite(element,
        {
            width: 600,
            height: 350,
            frames: 60,
            cols: 13,
            loop: true,
            //autoplay: false,
            //frameTime: 45,
            //duration: 1000,
            fps: 45,
            //reverse: false,
            inversion: true,
            draggable: true,
            //touchScrollMode: "pageScrollTimer",
            //pageScrollTimerDelay: 2000,
        }
    );
    setupControls(sprite1);
    setupEvents(element);

    // Controls
    function setupControls(sprite){
        let playBtn = document.querySelector(".js-play"),
            stopBtn = document.querySelector(".js-stop"),
            toggleBtn = document.querySelector(".js-toggle"),
            nextBtn = document.querySelector(".js-next"),
            prevBtn = document.querySelector(".js-prev"),
            resetBtn = document.querySelector(".js-reset");

        playBtn.addEventListener('click', () => { sprite.play(); });
        stopBtn.addEventListener('click', () => { sprite.stop(); });
        toggleBtn.addEventListener('click', () => { sprite.toggle(); });
        nextBtn.addEventListener('click', () => { sprite.next(); });
        prevBtn.addEventListener('click', () => { sprite.prev(); });
        resetBtn.addEventListener('click', () => { sprite.reset(); });

        let reverse = sprite.getReverse();
        document.querySelector(".js-reverse").addEventListener('change', (event) => {
            reverse = !reverse;
            sprite.setReverse(reverse);
        });
        document.querySelector(".js-reverse").checked = reverse;

        let loop = sprite.getOption('loop');
        document.querySelector('.js-loop').addEventListener('change', () => {
            loop = !loop;
            sprite.setOption('loop', loop);
        });
        document.querySelector('.js-loop').checked = loop;

        let draggable = sprite.getOption('draggable');
        document.querySelector('.js-draggable').addEventListener('change', () => {
            draggable = !draggable;
            sprite.setOption('draggable', draggable);
        });
        document.querySelector('.js-draggable').checked = draggable;


        // Inputs
        document.querySelector(".js-frames-input").addEventListener('input', function() { sprite.setFrame(this.value); });
        document.querySelector(".js-set-frame").addEventListener('click', function() {
            sprite.setFrame( this.closest('.js-option-block').querySelector('input').value );
        });
        document.querySelector('.js-play-to').addEventListener('click', function() {
            sprite.playTo(this.closest('.js-option-block').querySelector('input').value);
        });
        document.querySelector('.js-play-frames').addEventListener('click', function() {
            sprite.playFrames(this.closest('.js-option-block').querySelector('input').value);
        });
        document.querySelector(".js-set-duration").addEventListener('click', function() {
            sprite.setOption( 'duration', this.closest('.js-option-block').querySelector('input').value );
        });
        document.querySelector(".js-set-frame-time").addEventListener('click', function() {
            sprite.setOption( 'frameTime', this.closest('.js-option-block').querySelector('input').value );
        });
        document.querySelector(".js-set-fps").addEventListener('click', function() {
            sprite.setOption( 'fps', this.closest('.js-option-block').querySelector('input').value );
        });
    }

    function setupEvents(element){
        element.addEventListener('sprite:drag-start', function () {
            console.log('sprite:drag-start');
        });
        element.addEventListener('sprite:drag-change', function () {
            console.log('sprite:drag-change');
        });
        element.addEventListener('sprite:drag-end', function (event) {
            //console.log(event.detail.frame);
            console.log('sprite:drag-end');
        });
    }

    // Second example
    let element2 = document.getElementById('sprite2');
    let sprite2 = new AnimateSprite(element2,
        {
            width: 600,
            height: 350,
            cols: 13,
            frames: 61,
            duration: 1000,
            loop: false,
        }
    );
    element2.addEventListener('mouseenter', () => {
        sprite2.setReverse(false).play();
    });
    element2.addEventListener('mouseleave', () => {
        sprite2.setReverse(true).play();
    });
});

