const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const glob = require("glob")
/**
 * 自动生成索引文件
 * @param {String} root 要生成索引的根目录
 * @param {Object} options 下面的是options 的属性
 *        @prop {String} match 子模块的匹配规则
 *        @prop {Regex} separator 子模块目录(文件)命名分割符默认为 /(-|_)/g
 *        @prop {String} exportPattern 子模块导出模板
 *        @prop {String} suffix 生成index文件的后缀默认为 '.js'
 * @desc
 * 假设有目录结构如下自动生成componets的索引文件index.js
 * - componets
 *  + button
 *    - index.js
 *  + foo-bar
 *    - index.js
 *  + nest
 *    + child-nest
 *      - index.js
 *      + grandson-nest
 *        - index.js
 * 自动生成components/index.js
 * 
 *  export { default as Button , IButtonProps } from './button'
 *  export { default as FooBar , IFooBarProps } from './foo-bar'
 *  export { default as Nest , INestProps } from './nest'
 *  export { default as ChildNest , IChildNestProps } from './nest/child-nest'
 *  export { default as GrandsonNest , IGrandsonNestProps } from './nest/child-nest/grandson-nest'
 * @example
 *  autoImport('components', {
 *   match: '*.js',// 此处参数为glob类型
 *   separator: /(-|_)/g,
 *   exportPattern: `export { default as [name] , I[name]Props } from '[path]'`
 * })
 * @todo
 *  [ ] custom getName function
 */

module.exports = (root, options = {}) => {
  const { match, separator = /(-|_)/g, exportPattern, suffix = "js" } = options
  const dirs = glob.sync(path.resolve(root, match))

  const result = dirs.map(from => {
    const name = getPascal(path.parse(from).name, separator)
    const filePath = `./${path.relative(root, from)}`
    const exportTemplate = exportPattern
      .replace(/\[name\]/g, name)
      .replace(/\[path\]/g, filePath)

    return exportTemplate
  })

  const str = result.join("\n")
  fs.writeFileSync(path.join(root, `index.${suffix}`), `${str}\n`)
  console.log(
    chalk.green(`${path.join(root, `index.${suffix}`)} update succeed!`)
  )
}
function capitalize([first, ...rest]) {
  return first.toUpperCase() + rest.join("")
}

function getPascal(x, separator) {
  const arr = x.split(separator)
  let str = capitalize(x)
  if (arr.length > 1) {
    str = arr.reduce((a, b) => capitalize(a) + capitalize(b))
  }
  return str.replace(separator, "")
}
function getCamel([first, ...rest]) {
  return first.toLowerCase() + rest.join("")
}
