/* eslint-disabled */
const postcss = require('postcss')
const {
  assert
} = require('dark-fns')

const {
  isUnDef,
  isNull
} = assert

exports.deleteEmptyChar = (str) => {
  return str.replace(/\s/g, '')
}

exports.hasPrefix = (prop) => {
  return /^-\w+-/.test(prop)
}

function addTime (a, b) {
  let [aNum, aUnit] = getTimeInfo(a)
  let [bNum, bUnit] = getTimeInfo(b)
  // console.log(aUnit, bUnit)

  if (aUnit === bUnit) {
    return +aNum + +bNum + aUnit
  } else {
    aNum = toMs(aNum, aUnit)
    bNum = toMs(bNum, bUnit)
    return aNum + bNum + 'ms'
  }

  function getTimeInfo (str) {
    let match = str.match(/(\d+)(m?s)?/)
    return [match[1], match[2] || 'ms']
  }

  function toMs (num, unit) {
    if (/^ms$/i.test(unit)) {
      return +num
    }
    return num * 1000
  }
}

function normalizeMergeRule (rule, json) {
  // save props of merge rule
  let props = {}

  for (let [key, val] of Object.entries(rule)) {
    if (key === 'type') {
      props[key] = val
      continue
    }
    props[key] = comma(val)
  }

  if (!props.type) {
    props.type = 'animate'
  }

  // fill props of conf
  if (props.conf) {
    fillProp('conf')
    linkConfigure('conf')
    delete props.conf
  }

  // fill props of animate
  if (props.type === 'animate') {
    linkConfigure('name', 'animate')
  }

  function linkConfigure (propKey, confKey) {
    props[propKey].forEach((propKey, idx) => {
      let configure = getProp('.' + (confKey || propKey), confKey)
      if (!isNull(configure)) {
        for (let [key, val] of Object.entries(configure)) {
          let match = key.match(/^animation-(.+)/)
          if (isNull(match)) {
            let key = match[1]
            if (!isUnDef(props[key])) {
              if (isUnDef(props[key][idx])) {
                props[key][idx] = val
              }
            } else {
              props[key] = [ val ]
            }
          }
        }
      }
    })
  }

  if (!props.duration) {
    props.duration = ['0']
  }

  if (!props.delay) {
    props.delay = ['0']
  }

  ['duration', 'delay'].forEach(prop => {
    fillProp(prop)
  })

  function fillProp (key) {
    let prop = props[key]
    let propLen = prop.length
    let nameLen = props.name.length
    if (propLen < nameLen) {
      for (let i = propLen; i < nameLen; i++) {
        prop.push(prop[propLen - 1])
      }
    }
  }

  function comma (prop) {
    if (prop) {
      return postcss.list.comma(prop)
    }
  }

  function getProp (name, key) {
    let items = json[key]
    for (let value of Object.values(items)) {
      if (value.name === name) {
        return value.prop
      }
    }
    return null
  }

  return props
}

exports.getMergeJson = (rule, json) => {
  let mergeJson = normalizeMergeRule(rule, json)

  let css = {
    name: '',
    duration: '',
    delay: ''
  }

  let specialProp = ['type', 'name', 'duration', 'delay']

  // merge animate
  if (mergeJson.type === 'animate') {
    let preTime = '0'
    mergeJson.name.forEach((item, idx) => {
      let match = item.match(/\[(.*)\]/)
      let duration = mergeJson.duration[idx]
      let delay = addTime(preTime, mergeJson.delay[idx])
      let names = match === null ? [item] : postcss.list.space(match[1])
      names.forEach(name => {
        css.name += name + ', '
        css.duration += duration + ', '
        css.delay += delay + ', '
        for (let [key, val] of Object.entries(mergeJson)) {
          if (specialProp.indexOf(key) < 0) {
            if (isUnDef(css[key])) {
              css[key] = ''
            }
            css[key] += val[idx] + ', '
          }
        }
      })
      preTime = addTime(duration, delay)
    })

    // delete the end char ', '
    for (let [key, val] of Object.entries(css)) {
      css[key] = val.substr(0, val.length - 2)
    }
  }

  return css
}

exports.getMergeCss = (json) => {
  let result = {}
  for (let [key, val] of Object.entries(json)) {
    result['animation-' + key] = val
  }
  return result
}
