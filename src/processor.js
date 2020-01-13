/* eslint-disabled */
const postcss = require('postcss')
const path = require('path')
const fs = require('fs')
const utils = require('./utils')
const mkdirp = require('mkdirp')
const beautify = require('beautify')

const {
  assert,
  object
} = require('dark-fns')

const {
  isUnDef
} = assert

class Processor {
  constructor (opts) {
    this._opts = this.normalizeOpts(opts)
    this._json = this.toJson(this._opts)
  }
  normalizeOpts (opts) {
    const defaultOpts = {
      filename: ['animate.css'],
      conf: ["\.animated.*"],
      path: './',
      json: {
        save: true,
        load: false,
        output: 'animate.json'
      }
    }
    return object.mixin(defaultOpts, opts)
  }
  toJson (opts) {
    if (opts.json.load) {
      let obj = {}
      opts.filename.forEach(file => {
        obj = object.mixin(obj, require(path.resolve(opts.path, file)))
      })
      return obj
    }
    let root
    let json = {
      conf: [],
      animate: [],
      keyframes: []
    }
    opts.filename.forEach(file => {
      let content = fs.readFileSync(path.resolve(opts.path, file)).toString()
      let tmpRoot =  postcss.parse(content)
      if (root) {
        root.append(tmpRoot)
      } else {
        root = tmpRoot
      }
    })
    let conf = opts.conf
    root.walkRules(rule => {
      let tmp = {
        name: rule.selector,
        prop: {}
      }
      if (rule.parent.type === 'atrule' && /.*keyframes/.test(rule.parent.name)) return
      if (conf.some(c => new RegExp(c).test(rule.selector))) {
        rule.walkDecls(/^animation.*/, decl => {
          tmp.prop[decl.prop] = decl.value
        })
        json.conf.push(tmp)
      } else {
        rule.walkDecls(decl => {
          if (!utils.hasPrefix(decl.prop))
            tmp.prop[decl.prop] = decl.value
        })
        json.animate.push(tmp)
      }
    })
    root.walkAtRules('keyframes', atrule => {
      let keyframe = {
        name: atrule.params,
        nodes: []
      }
      atrule.walkRules(rule => {
        let node = { name: rule.selector, prop: {} }
        rule.walkDecls(decl => {
          if (!utils.hasPrefix(decl.prop))
            node.prop[decl.prop] = decl.value
        })
        keyframe.nodes.push(node)
      })
      json.keyframes.push(keyframe)
    })
    return json
  }
  transform (root) {
    root.walkAtRules('merge', (atrule) => {
      let selector = atrule.params
      // normalize
      let mergeRule = {
        type: 'animate'
      }
      atrule.walkDecls(decl => {
        mergeRule[decl.prop] = decl.value
      })
      let cssJson = utils.getMergeJson(mergeRule, this._json)
      let css = utils.getMergeCss(cssJson)
      this._json.animate.push({
        name: selector,
        prop: css
      })
      let propStr = ''
      for (let [key, val] of Object.entries(css)) {
        propStr += `${key}: ${val};`
      }
      atrule.parent.append(beautify(`${selector} {${propStr}}`, {format: 'css'}))
      atrule.remove()
    })
  }
  saveJson (options) {
    const json = this._json
    if (isUnDef(json)) {
      console.error('Please inject animation.')
    }
    if (this._opts.json.save) {
      const dir = path.dirname(path.resolve(this._opts.path, this._opts.json.output))
      if(!fs.existsSync(dir)) {
        mkdirp.sync(dir)
      }
      fs.writeFileSync(path.join(dir, path.basename(this._opts.json.output)), JSON.stringify(json, null, 2), options)
    }
  }
}

module.exports = Processor
