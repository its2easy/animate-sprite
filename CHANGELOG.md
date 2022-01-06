# Changelog
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

