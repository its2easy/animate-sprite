<h1 align="center">
   Animate Sprite
</h1>

Demo - [codepen](https://codepen.io/its2easy/pen/VwvVRed)

**animate-sprite** is a lightweight library (5kb minified) which allows to animate a 
sequence of frames that looks like 3d. It supports playing full animation
sequence, rotate an image by the mouse and touch, autoplay, loop, 
reverse and exposes an API to programmatically control the animation.

To use it you have to export animation from your 3d app as a series of 
frames and combine them in one image file (sprite).

* [Installation](#installation)
* [Usage](#usage)
* [Options](#options)
* [Methods](#methods)
* [Browser support](#browser_support)
* [License](#license)

## <a name="installation"></a>Installation
### Script tag
Download
<a href="build/animate-sprite.min.js" download>minified version</a>

Include in html
```
<script src="animate-sprite.min.js"></script>
```
### npm
todo

## <a name="usage"></a>Usage
Create an element with background
```
<div id="sprite" style="background-image: url('images/sprite.jpg')"></div>
```
Initialize with options
```
var element = document.getElementById('sprite');
var sprite = animateSprite.init(element,
    {
            width: 800, /* required */
            height: 450, /* required */
            cols: 10,
            frames: 90, /* required */
            fps: 60,
            loop: true,
            draggable: true
    }
);
sprite.play();
```
Or with inline options
```
<div id="sprite" 
    style="background-image: url('images/sprite.jpg')"
    data-width="700"
    data-heigth="400"
    data-frames="60"
></div>
```
```
var element = document.getElementById('sprite');
var sprite = animateSprite.init(element);
sprite.play();
```
> Inline options have higher priority

### Usage with bundlers
```
import { init as spriteInit } from 'animate-sprite';
let sprite = spriteInit(element, options);
```


### Responsive behavior
By default, you don't have to specify block sizes in css. Element with the
sprite will take all available width and set its height based on width/height
ratio from configuration options. To limit the size add `max-width` to the
sprite. You can also explicitly set `width`, but it will no longer adapt 
to the container width (on small screens this can be changed with 
`width: auto` inside media query).

On page load sprite block will have 0px height, to prevent this you can manually
add `height` style (and maybe `backgroud-size`), it will be overwritten
after initialization. 


## <a name="options"></a>Options

| Parameter  | Required | Default | Description |
| :---:  | :---:| --- | ---  |
| **width** | :heavy_check_mark:  |   | Width of one frame in a sprite  |
| **height** | :heavy_check_mark: |   | Height of one frame in a sprite  |
| **frames** | :heavy_check_mark: |   | Total number of frames  |
| **cols** |  | false | Number of cols if more than 1 row |
| **loop** |  | false |  Whether to start a new cycle at the end |
| **reverse** |  | false |  Reverse direction |
| **autoplay** |  | false |  Autoplay |
| **draggable** |  | false |  Draggable by mouse or touch |
| **frameTime** |  |  |  ms, time between frames |
| **duration** |  |  |  ms, total time, alternative to frameTime |
| **fps** |  | 24 |  fps, alternative to frameTime |

> If multiple time options (`frameTime`, `duration` or `fps`) are set at the 
same time, `frameTime` has higher priority, then `duration`, then `fps`.

## <a name="methods"></a>Methods
### init
Initializes an instance of a sprite

`parameters`
- element : NodeElement - dom element
- options : Object - configuration [options](#options)

### play
Starts animation

### stop
Starts animation

### prev
Animate to the previous frame

### next
Animate to the next frame

### reset
Stop animation and move to the first frame

### setFrame
Set frame (without animation)

`parameters`
- frame : Number - Frame number
```
sprite.setFrame(35);
```
### setReverse
Change the direction of the animation

`parameters`
- reverse : Bool - true to reverse, false to normal direction
```
sprite.setReverse(true);
```
### setOption
It sets one of the allowed  options (`frameTime`, `duration`, `fps`) on the fly

`parameters`
- option : String - Option name
- value : Number - New value
```
sprite.setOption('frameTime', 40);
```

### destroy
Destroy sprite instance

### getCurrentFrame
Returns current frame number

### isAnimating
Returns `true` if sprite is animating, else `false`

## <a name="browser_support"></a>Browser support
It supports browsers that have more than 1% usage and not dead
* latest versions of Chrome, android Chrome, Firefox
* Safari 13+, 
* iOS Safari 12.2+, 
* Edge 18+
* some rare browsers

## <a name="license"></a>License
Animate Sprite is provided under the [MIT License](https://opensource.org/licenses/MIT)