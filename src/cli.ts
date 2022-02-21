import {program} from 'commander'
import {parse, print, visit, prettyPrint} from 'recast'
import transformers from './transformers'
import {promises} from 'fs'
import {tryCatch} from 'ramda'
import {diffLines} from 'diff'
const colors = require('colors')

const transformSource = async (path: string) => {
  const src = await promises.readFile(path, 'utf-8')
  const ast = parse(src, {parser: require('recast/parsers/typescript')})
  visit(ast, transformers)
  const newSrc = print(ast).code
  if (src === newSrc) return false
  return {src, newSrc}
}

const printDiff = async (path: string) => {
  const code = await transformSource(path)
  if (!code) return
  console.log(code)
  diffLines(code.src, code.newSrc).forEach((part) => {
    const color = part.added ? 'green' : part.removed ? 'red' : 'grey'
    console.log(part.value[color])
  })
}

const rewriteSource = async (path: string) => {
  const code = await transformSource(path)
  if (!code) return
  const newFh = await promises.open(path, 'w')
  newFh.writeFile(code.newSrc)
  console.log(`${path} written`)
}

program.option('--dry')
const args = program.parse(process.argv)

args.args.forEach(program.opts().dry ? printDiff : rewriteSource)
