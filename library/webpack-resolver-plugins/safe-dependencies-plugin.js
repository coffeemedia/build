const path = require('path')

const p = 'safe-dependencies-plugin'

const cwdPackageJson = path.resolve(process.cwd(), 'package.json')
const libPackageJson = path.resolve(__dirname, '../package.json')

module.exports = function safeDependenciesPlugin(srcDir) {
  return {
    apply: resolver => {
      const cwdPackages = getPackages(cwdPackageJson)
      const libPackages = getPackages(libPackageJson)
      const allPackages = Object.assign({}, cwdPackages, libPackages)

      resolver.hooks.module.tapAsync(p, (request, resolveContext, callback) => {
        const { request: innerRequest, context: { issuer } } = request
        if (issuer.startsWith(srcDir)) {
          const packageName = getPackageName(innerRequest)
          if (!allPackages[packageName]) return callback(`'${innerRequest}', import prevented because '${packageName}' was not specified in the 'package.json' file`)
        }

        return callback()
      })

      function getPackages(packageJson) {
        const content = require(packageJson).dependencies
        return Object.keys(content).reduce((o, k) => { o[k] = true; return o },  {})
      }

      function getPackageName(request) {
        const [firstPart, secondPart] = request.split('/')
        return request.startsWith('@')
          ? firstPart + '/' + secondPart
          : firstPart
      }
    }
  }
}
