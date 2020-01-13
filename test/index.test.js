let postcss = require('postcss')

let plugin = require('../src')

async function run (input, output, opts) {
  let result = await postcss([plugin(opts)]).process(input, { from: undefined })
  expect(result.css).toEqual(output)
  expect(result.warnings()).toHaveLength(0)
}

it('parse @merge', async () => {
  // let input = '@merge .newAnimate {name: bounce, [bounce slideUpDown], bounce;duration: 1s;}'
  // let output = '.newAnimate {animation-name: bounce, bounce, slideUpDown, bounce;animation-duration: 1s, 1s, 1s, 1s;animation-delay: 0ms, 1000ms, 1000ms, 2000ms;}'
  let input = `@merge .newAnimate {
    name: bounce, [bounce slideUp], bounce;
    duration: 1s;
}
  `
  let output = `.newAnimate {
    animation-name: bounce, bounce, slideUp, bounce;
    animation-duration: 1s, 1s, 1s, 1s;
    animation-delay: 0ms, 1000ms, 1000ms, 2000ms;
}
  `
  await run(input, output)
})
