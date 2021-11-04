<h1 align="center">
   Animate Sprite
</h1>

![npm (scoped)](https://img.shields.io/npm/v/@its2easy/animate-sprite)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@its2easy/animate-sprite)
![David](https://img.shields.io/david/its2easy/animate-sprite)

Demo - [codepen](https://codepen.io/its2easy/pen/VwvVRed)

**animate-sprite** is a lightweight library (5.5kb minified) which allows to animate a 
sequence of frames that looks like 3d. It supports playing full animation
sequence, rotate an image by the mouse and touch, autoplay, loop, 
reverse and exposes an API to programmatically control the animation.

To use it you should export animation from your 3d app as a series of 
frames and combine them in one image file (sprite).

* [Installation](#installation)
* [Usage](#usage)
* [Options](#options)
* [Methods](#methods)
* [Events](#events)
* [Browser support](#browser_support)
* [License](#license)

## <a name="installation"></a>Installation
### Browser script tag
Add with CDN link:
```html
<script src="https://cdn.jsdelivr.net/npm/@its2easy/animate-sprite"></script>
```

### npm
```
npm i @its2easy/animate-sprite --save
```

## <a name="usage"></a>Usage
Create an element with background
```html
<div id="sprite" style="background-image: url('images/sprite.jpg')"></div>
```
Initialize with options
```javascript
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
```html
<div id="sprite" 
    style="background-image: url('images/sprite.jpg')"
    data-width="700"
    data-heigth="400"
    data-frames="60"
></div>
```
```javascript
var element = document.getElementById('sprite');
var sprite = animateSprite.init(element);
sprite.play();
```
> Inline options have higher priority

### Usage with bundlers
```javascript
import { init as spriteInit } from '@its2easy/animate-sprite';
let sprite = spriteInit(element, options);
```
It is possible to directly import untranspiled esm version:
```javascript
import { init as spriteInit } from '@its2easy/animate-sprite/build/untranspiled/animate-sprite.esm.min.js'; //or animate-sprite.esm.js
let sprite = spriteInit(element, options);
```
> :warning: You should probably add it to your build process if you use untranspiled version. Example for webpack:
```javascript
rules: [
    {
        test: /\.js$/,
        exclude: /node_modules(?!(\/|\\)@its2easy(\/|\\)animate-sprite(\/|\\)build)/,
        use: {
            loader: 'babel-loader',
        }
    }
]
```
or
```javascript
rules: [
    {
        // basic js rule
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
            loader: 'babel-loader',
        }
    },
    {
        // additional rule
        test: /\.js$/,
        include: /node_modules(\/|\\)@its2easy(\/|\\)animate-sprite(\/|\\)build/,
        use: {
            loader: 'babel-loader',
    }
]
```
#### All available versions:
#####umd build:

`@its2easy/animate-sprite/build/animate-sprite.umd.min.js` - default for browser script tag and legacy bundlers

#####esm builds processed whit babel:

`@its2easy/animate-sprite/build/animate-sprite.esm.min.js` - default for webpack and module environments

`@its2easy/animate-sprite/build/animate-sprite.esm.js`

#####esm builds without babel transformation:

`@its2easy/animate-sprite/build/untranspiled/animate-sprite.esm.min.js`

`@its2easy/animate-sprite/build/untranspiled/animate-sprite.esm.js`

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
| :---  | :---:| :---: | ---  |
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
>  Methods can be chained ```sprite.setReverse(true).play()```
### init
Initializes and returns an instance of a sprite.

`parameters`
- element : NodeElement - dom element
- options : Object - configuration [options](#options)

### play
Starts animation

### stop
Stops animation

### toggle
Toggle between play and stop

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
```javascript
sprite.setFrame(35);
```
### setReverse
Change the direction of the animation

`parameters`
- reverse : Bool - true to reverse, false to normal direction
```javascript
sprite.setReverse(true);
```
### setOption
It sets one of the allowed  options (`frameTime`, `duration`, `fps`) on the fly

`parameters`
- option : String - Option name
- value : Number - New value
```javascript
sprite.setOption('frameTime', 40);
```

### destroy
Destroy sprite instance

### getCurrentFrame
Returns current frame number

### isAnimating
Returns `true` if sprite is animating, else `false`

## <a name="events"></a>Events

#### sprite:last-frame
fires after the last frame is set
#### sprite:first-frame 
fires after the first frame is set (when ```reverse``` 
is ```true```)

#### sprite:drag-start
Fires when user starts dragging. Frame number is in `event.detail.frame`

#### sprite:drag-change
Fires on every frame change while dragging. Frame number is in `event.detail.frame`

#### sprite:drag-end
Fires when user stops dragging. Frame number is in `event.detail.frame`

Example:
```javascript
var element = document.getElementById('sprite');
element.addEventListener('sprite:drag-end', function (event) {
    console.log(event.detail.frame);
})
```

## <a name="browser_support"></a>Browser support
* latest versions of Chrome, android Chrome, Edge, Firefox
* Safari 13+
* iOS Safari 13+

## <a name="license"></a>License
Animate Sprite is provided under the [MIT License](https://opensource.org/licenses/MIT)
