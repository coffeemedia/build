const { RawSource } = require('webpack-sources')
const { evalWithSourceMap } = require('../lib/node-utils')
const { renderWith } = require('../lib/template-utils')

module.exports = function reactTemplatePlugin(entries) {

  return {
    apply: compiler => {
      compiler.plugin('compilation', compilation => {

        // render templates to html -- we should probably do this earlier, before the uglifier / babili kicks in
        compilation.plugin('optimize-assets', (assets, done) => {
          const renders = []
          
          for (const name in assets) {
            const entry = entries[name]
            if (!entry || !entry.endsWith('.html.js')) continue
            const asset = assets[name]
            delete assets[name]
            
            const source = asset.source()
            const map = asset.map()
            renders.push(
              evalWithSourceMap(source, map)
                .then(template => template ? template : Promise.reject(new Error(`${name} did not export a template`)))
                .then(template => typeof template === 'function'
                  ? createDynamicTemplate(source, map)
                  : createStaticTemplate(map, template)
                )
                .then(([ext, result]) => { assets[name + ext] = new RawSource(result) })
                .catch(e => { compilation.errors.push(e.message) })
            )
          }

          Promise.all(renders).then(_ => done())
        })
      })
    }
  }
}

function createStaticTemplate(map, template) {
  return renderWith(map)(template).then(html => ['.html', html])
}

function createDynamicTemplate(source, map) {
  return [
    '.html.js',
    `|const { createRenderFunction } = require('kaliber-build/lib/template-utils')
     |const source = ${JSON.stringify(source)}
     |const map = ${JSON.stringify(map)}
     |module.exports = createRenderFunction(source, map)
     |`.split(/^[ \t]*\|/m).join('')
  ]
}