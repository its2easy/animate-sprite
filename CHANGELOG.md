# Changelog
## 2.2.0
- new ```onAnimationEnd``` and ```onFrameChange``` callbacks
- new ```sprite:animation-end``` event
- new ```dragModifier``` option
- more validations
- fix wrong animation duration
- ```inversion``` is now only used while dragging and doesn't affect animation
- proper handling of empty animation in ```playTo``` and ```playFrames```
- fix animation stop after dragging and loop: false
- umd version filename is now ```build/animate-sprite.umd.min.js```
## 2.1.0
- add types, fix documentation
## 2.0.1
- fix package.json main key
## 2.0.0
- plugin import changed
- new initialization with constructor instead of ```init``` method  
- inline options format has changed from ```data-width``` to ```data-sprite-width```
- new options ```inversion```, ```touchScrollMode``` and ```pageScrollTimerDelay```
- new methods ```playTo```, ```playFrames```, ```getOption```, ```updateSizes``` and 
  ```getReverse``` (alias to ```getOption("reverse")```)
- all options are now allowed in ```setOption```
- all options are now allowed as inline options
- ```sprite:last-frame``` and ```sprite:first-frame``` events have been removed
- supported browsers have changed (Safari 13.1+, iOS Safari 13.4+)

