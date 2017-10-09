const ansiRegex = require('ansi-regex');

console.log('Starting hot module reload client with port', __webpack_websocket_port__)
const ws = new WebSocket('ws://localhost:' + __webpack_websocket_port__)

ws.onopen = _ => { console.log('Waiting for signals') }
ws.onmessage = ({ data }) => {
  const { type, hash } = JSON.parse(data)

  switch (type) {
    case 'done':
      if (!hash || __webpack_hash__ === hash) return // eslint-disable-line no-undef
      module.hot.check(false)
        .then(updatedModules => {
          if (!updatedModules) { /* no updates */ }

          module.hot.apply({
            ignoreErrored: true,
            onErrored: ({ error }) => {
              error.message = error.message.replace(ansiRegex(), '')

              console.error(error)
            }
          }).then(renewedModules => {
              const ignoredModules = updatedModules.filter(x => !renewedModules.includes(x))
              if (ignoredModules.length) console.warn('Ignored modules: ' + ignoredModules.join(', '))
            })
            .catch(err => {
              console.error('Error during hot reload apply')
              console.error(err)
            })
        })
        .catch(err => {
          console.error('Problem checking for hot reload updates')
          console.error(err)
        })
      break;
    case 'failed':
      console.warn('Compilation failed')
      break;
    default:
      throw new Error(`Unexpected type '${type}'`)
  }
}
