$(function () {
    // First example
    var element = document.getElementById('sprite1');
    var sprite1 = animateSprite.init(element,
        {
            width: 600,
            height: 350,
            cols: 13,
            frames: 60,
            //frameTime: 45,
            //duration: 1000,
            fps: 45,
            loop: true,
            draggable: true
        }
    );

    // Controls
    $('.js-play').on('click', function () {
        sprite1.play();
    });
    $('.js-stop').on('click', function () {
        sprite1.stop();
    });
    $('.js-toggle').on('click', function () {
        sprite1.toggle();
    });
    $('.js-next').on('click', function () {
        sprite1.next();
    });
    $('.js-prev').on('click', function () {
        sprite1.prev();
    });
    $('.js-reset').on('click', function () {
        sprite1.reset();
    });
    var reverse = true;
    $('.js-reverse').on('click', function () {
        sprite1.setReverse(reverse);
        reverse = !reverse
    });
    $('.js-frames-input').on('input', function () {
        sprite1.setFrame($(this).val());
    });
    // Inputs
    $('.js-set-frame').on('click', function () {
        sprite1.setFrame($(this).closest('.js-option-block').find('input').val() );
    });
    $('.js-set-duration').on('click', function () {
        sprite1.setOption('duration', $(this).closest('.js-option-block').find('input').val());
    });
    $('.js-set-frame-time').on('click', function () {
        sprite1.setOption('frameTime', $(this).closest('.js-option-block').find('input').val());
    });
    $('.js-set-fps').on('click', function () {
        sprite1.setOption('fps', $(this).closest('.js-option-block').find('input').val());
    });
    element.addEventListener('sprite:last-frame', function () {
        console.log('last frame');
    });
    element.addEventListener('sprite:first-frame', function () {
        console.log('first frame');
    });

    // Second example
    var element2 = document.getElementById('sprite2');
    var sprite2 = animateSprite.init(element2,
        {
            width: 600,
            height: 350,
            cols: 13,
            frames: 61,
            duration: 1000,
            loop: false,
        }
    );
    $('.sprite2').mouseenter(function () {
        sprite2.setReverse(false).play();
    });
    $('.sprite2').mouseleave (function () {
        sprite2.setReverse(true).play();
    });
});

