<h1 align="center">
   Animate Sprite
</h1>

![npm (scoped)](https://img.shields.io/npm/v/@its2easy/animate-sprite)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@its2easy/animate-sprite)

Demo - [codepen](https://codepen.io/its2easy/pen/VwvVRed)

**animate-sprite** is a library (11kb without gzip) without built-in UI which allows to animate a 
sequence of frames that looks like 3d rotation. It supports playing full animation
sequence, play specified number of frames, rotate an image by the mouse and touch; and 
exposes an API to programmatically control the animation.

To use it you should export animation from your 3d software as a series of 
frames and combine them into one image file (sprite). If you want to use a sequence of 
images instead of a single sprite, you could use [animate-images](https://github.com/its2easy/animate-images).

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
Create an element with a background:
```html
<div id="sprite" style="background-image: url('images/sprite.jpg')"></div>
```
Initialize with options:
```javascript
let element = document.getElementById('sprite');
let sprite = new AnimateSprite(element,
    {
        width: 800, /* required */
        height: 450, /* required */
        frames: 90, /* required */
        cols: 10,
        fps: 60,
        loop: true,
        draggable: true
    }
);
sprite.play();
```
Or with inline options and then initialize it:
```html
<div id="sprite" 
    style="background-image: url('images/sprite.jpg')"
    data-sprite-width="700"
    data-sprite-heigth="400"
    data-sprite-frames="45"
    data-sprite-autoplay="true"
    data-sprite-touch-scroll-mode="allowPageScroll"
></div>
```
```javascript
let sprite = new AnimateSprite(document.getElementById('sprite'));
```
> Inline options have higher priority

### Usage with bundlers
```javascript
import AnimateSprite from '@its2easy/animate-sprite';
let sprite = new AnimateSprite(element, options);
```
It is possible to directly import untranspiled esm version:
```javascript
import AnimateSprite from '@its2easy/animate-sprite/build/untranspiled/animate-sprite.esm.js'; //or animate-sprite.esm.min.js
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
##### umd build:

`@its2easy/animate-sprite/build/animate-sprite.umd.min.js` - default for browser script tag and legacy bundlers

##### esm builds processed whit babel:

`@its2easy/animate-sprite/build/animate-sprite.esm.min.js` - default for webpack and module environments

`@its2easy/animate-sprite/build/animate-sprite.esm.js`

##### esm builds without babel transformation:

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

| Parameter  | Type | Required | Default | Description |
| :--- | :--- | :---:| :---: | ---  |
| **width** <br> ```data-sprite-width``` | number | :heavy_check_mark:  |   | Width of one frame in a sprite  |
| **height** <br> ```data-sprite-height``` | number | :heavy_check_mark: |   | Height of one frame in a sprite  |
| **frames** <br> ```data-sprite-frames``` | number | :heavy_check_mark: |   | Total number of frames  |
| **cols** <br> ```data-sprite-cols```| number&#124;false |  | false | Number of cols if more than 1 row |
| **loop** <br> ```data-sprite-loop``` | boolean |  | false |  Loop the animation |
| **autoplay** <br> ```data-sprite-autoplay``` | boolean |  | false |  Autoplay |
| **frameTime** <br> ```data-sprite-frame-time``` | number&#124;false | | false |  ms, time between frames |
| **duration** <br> ```data-sprite-duration``` | number&#124;false |  | false |  ms, total time, alternative to frameTime |
| **fps** <br> ```data-sprite-fps``` | number&#124;false |  | 24 |  fps, alternative to frameTime |
| **reverse** <br> ```data-sprite-reverse``` | boolean |  | false |  Reverse direction of animation |
| **inversion** <br> ```data-sprite-inversion``` | boolean |  | false |  Inversion defines base direction. It differs from ```reverse``` in that reverse means forward or backward, and inversion determines which direction is forward. Affects animation and drag |
| **draggable** <br> ```data-sprite-draggable``` | boolean |  | false |  Draggable by mouse or touch |
| **touchScrollMode** <br> ```data-sprite-touch-scroll-mode``` | string | | "pageScrollTimer" | Page scroll behavior with touch events _(only for events that fire in the plugin area)_. Available modes: **preventPageScroll** - touch scroll is always disabled. **allowPageScroll** - touch scroll is always enabled. **pageScrollTimer** - after the first interaction the scroll is not disabled; if the time between the end of the previous interaction and the start of a new one is less than _pageScrollTimerDelay_, then scroll will be disabled; if more time has passed, then scroll will be enabled again |
| **pageScrollTimerDelay** <br> ```data-sprite-page-scroll-timer-delay``` | number | | 1500 | Time in ms when touch scroll will be disabled after the last user interaction, if touchScrollMode = "pageScrollTimer" |
| **onAnimationEnd** | function(AnimateSprite) | | | Callback, occurs when animation has ended, receives plugin instance as a parameter |

> If multiple time options (`frameTime`, `duration` or `fps`) are set at the 
same time, `frameTime` has higher priority, then `duration`, then `fps`.

## <a name="methods"></a>Methods
>  Methods can be chained ```sprite.setReverse(true).play()```
### new AnimateSprite(element, options)
Initializes and returns an instance of a sprite.

`parameters`
- element : {Element | HTMLElement} - HTML element
- options : {Object} - configuration [options](#options)

`returns` {AnimateSprite} - plugin instance

---

### play
Start animation

`returns` {AnimateSprite} - plugin instance

---

### stop
Stop animation

`returns` {AnimateSprite} - plugin instance

---

### toggle
Toggle between play and stop

`returns` {AnimateSprite} - plugin instance

---

### prev
Show the previous frame

`returns` {AnimateSprite} - plugin instance

---

### next
Show the next frame

`returns` {AnimateSprite} - plugin instance

---

### setFrame
Set frame (without animation)

`parameters`
- frameNumber : {number} - Frame number
```javascript
sprite.setFrame(35);
```
`returns` {AnimateSprite} - plugin instance

---

### playTo
Starts the animation, that plays until the specified frame number

`parameters`
- frameNumber {number} - Target frame number
```javascript
// if current frame is 30 of 100, it will play from 30 to 85, 
// if current frame is 95, it will play from 95 to 85
sprite.playTo(85);
```
`returns` {AnimateSprite} - plugin instance

---

### playFrames
Starts animation in the current direction with the specified number
of frames in queue. If `options.loop: false` animation will stop
if it reaches the first or the last frame.

`parameters`
- numberOfFrames {number} - Number of frames to play
```javascript
instance.playFrames(200);
```
`returns` {AnimateSprite} - plugin instance

---

### setReverse
Change the direction of the animation

`parameters`
- reverse : {boolean} - true to reverse, false to normal direction
```javascript
sprite.setReverse(true);
```
`returns` {AnimateSprite} - plugin instance

---

### updateSizes
Calculate new dimensions (sprite element and frame), should be called if element size was 
changes manually. updateSizes is called automatically after resize

`returns` {AnimateSprite} - plugin instance

---

### getOption
Returns option value

`parameters`
- option {string} -  Option name. All options are allowed.
```javascript
let loop = instance.getOption('loop');
```
`returns` {number|string|boolean} - Option value

---

### setOption
Set new option value

`parameters`
- option : String - Option name. All options are allowed.
- value : string|number|boolean - New value
```javascript
sprite.setOption('frameTime', 40);
```
`returns` {animateSprite} - plugin instance

---

### getCurrentFrame
Returns current frame number

`returns` {number} - Frame number

---

### isAnimating
Returns `true` if sprite is animating, else `false`

`returns` {boolean}

---

### getReverse
Returns current reverse value

`returns` {boolean} - reverse

---

### reset
Stop the animation and return to the first frame

`returns` {AnimateSprite} - plugin instance

---

### destroy
Stop animation, remove event listeners. Method doesn't remove sprite element from the DOM

---

## <a name="events"></a>Events

#### sprite:drag-start
Fires when user starts dragging. Frame number is in `event.detail.frame`

#### sprite:drag-change
Fires on every frame change while dragging. Frame number is in `event.detail.frame`

#### sprite:drag-end
Fires when user stops dragging. Frame number is in `event.detail.frame`

#### sprite:animation-end
Fires after the animation end. If the second animation was started
while the first was active, this event will be fired only after the
second animation end.

Example:
```javascript
var element = document.getElementById('sprite');
element.addEventListener('sprite:drag-end', function (event) {
    console.log(event.detail.frame);
})
```

## <a name="browser_support"></a>Browser support
* latest versions of Chrome, android Chrome, Edge, Firefox
* Safari 13.1+,
* iOS Safari 13.4+

## <a name="license"></a>License
Animate Sprite is provided under the [MIT License](https://opensource.org/licenses/MIT)
