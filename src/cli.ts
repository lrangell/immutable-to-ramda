import {program} from 'commander'
import {parse, print, visit} from 'recast'
import transformers from './transformers'
import {promises} from 'fs'
import {tryCatch} from 'ramda'

const rewriteSource = async (filepath: string) => {
  const src = await promises.readFile(filepath, 'utf-8')
  const ast = parse(src, {parser: require('recast/parsers/typescript')})
  visit(ast, transformers)
  const newSrc = print(ast).code
  if (src === newSrc) return
  const newFh = await promises.open(filepath, 'w')
  newFh.writeFile(print(ast).code)
  console.log(`${filepath} written`)
}
const args = program.parse(process.argv)

args.args.forEach(tryCatch(rewriteSource, () => ''))
