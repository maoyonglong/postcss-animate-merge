# PostCSS Js To Animate

[PostCSS] plugin merge animate defined in animate.css.

[PostCSS]: https://github.com/postcss/postcss

```css
@merge .newAnimate {
  /*
    only support animate which only include `animation-*` properties

    For example:
    shake is:
    .shake {
      -webkit-animation-name: shake;
      animation-name: shake;
    }
    it only include `animation-name` which matches `animation-*`

    bounce is:
    .bounce {
      -webkit-animation-name: bounce;
      animation-name: bounce;
      -webkit-transform-origin: center bottom;
      transform-origin: center bottom;
    }
    it includes `transform-origin` that is not support
   */
   /* the [shake slideUpDown] is meaning this two animation executes at the same time */
  name: shake, [shake slideUpDown], shake;
  duration: 1s;
  /* other `animation-*` properties also support: */
  /* delay, fill-mode, ... */

  /*
    especially it can appoint conf which is the base configure class, such as: .animate, .animate.delay-1s
    conf: animate, animate.delay-1s
   */

  /*
    all property will be fill by the last value if the len is less than name:
    name: shake, [shake slideUpDown], shake; // len is 3
    duration: 1s, 2s; // so will be duration: 1s, 2s, 2s;
  */

}
```

```css
.newAnimate {
  animation-name: shake, shake, slideOutDown, shake;
  animation-duration: 1s, 1s, 1s, 1s;
  animation-delay: 0ms, 1000ms, 1000ms, 2000ms;
}
```

## Usage

Check you project for existed PostCSS config: `postcss.config.js`
in the project root, `"postcss"` section in `package.json`
or `postcss` in bundle config.

If you already use PostCSS, add the plugin to plugins list:

```diff
module.exports = {
  plugins: [
+   require('postcss-animate-to-json'),
    require('autoprefixer')
  ]
}
```

## Options
```js
// the following is default value
{
  filename: ['animate.css'], // the filename of animate.css or its expansion
  conf: ["\.animated.*"], // the regexp to `conf` classed
  path: './', // the base path, filename and json.output will be execute relatived this path
  json: {
    save: true, // if save the json configure
    load: false, // if load json configure. if true, ignore filename
    output: 'animate.json' // the path to output the json configure file
  }
}
```


If you do not use PostCSS, add it according to [official docs]
and set this plugin in settings.

[official docs]: https://github.com/postcss/postcss#usage
