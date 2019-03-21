const path = require('path')

const cwdPackageJson = path.resolve(process.cwd(), 'package.json')
const libPackageJson = path.resolve(__dirname, '../package.json')

console.log(cwdPackageJson, libPackageJson)

module.exports = function saferDependenciesPlugin() {
  return {
    apply: resolver => {
      resolver.hooks.module.tapAsync(p, (request, resolveContext, callback) => {
        const { request: innerRequest, context: { issuer } } = request
        if (issuer.startsWith(srcDir)) {
          const packageName = getPackageName(innerRequest)
          if (!allPackages[packageName]) return callback(`'${innerRequest}', import prevented because '${packageName}' was not specified in the 'package.json' file`)
        }

        return callback()
      })
      const cwdPackages = getPackages(cwdPackageJson)
      const libPackages = getPackages(libPackageJson)
      const allPackages = {...cwdPackages, ...libPackages}


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
