import {program} from 'commander'
import {parse, print, visit, prettyPrint} from 'recast'
import transformers from './transformers'
import {promises} from 'fs'
import {tryCatch} from 'ramda'
import {diffLines} from 'diff'
import {rfunctions} from './transformers'
import {parseSync} from '@babel/core'
const colors = require('colors')

const parseFile = async (path: string) =>
  promises
    .readFile(path, 'utf-8')
    .then((src) => ({
      src,
      ast: parse(src, {
        parser: {
          parse: (source) =>
            parseSync(source, {
              plugins: [[`@babel/plugin-syntax-typescript`, {isTSX: true}]],
              overrides: [
                {
                  test: [`**/*.ts`, `**/*.tsx`],
                  plugins: [[`@babel/plugin-syntax-typescript`, {isTSX: true}]],
                },
              ],
              filename: path,
              parserOpts: {
                tokens: true,
              },
            }),
        },
      }),
    }))
    .catch((err) => {
      console.log(`unable to parse ${path}`['red'])
      console.log(err)
    })

const transformSource = async (path: string) => {
  const code = await parseFile(path)
  if (!code) return
  const {src, ast} = code
  visit(ast, transformers)
  const newSrc = print(ast).code
  if (src === newSrc) return false
  return {src, newSrc}
}

const printDiff = async (path: string) => {
  const code = await transformSource(path)
  if (!code) return
  diffLines(code.src, code.newSrc).forEach((part) => {
    const color = part.added ? 'green' : part.removed ? 'red' : null
    if (color) console.log(part.value[color])
  })
}

const importExpr = `import * as R from 'ramda'\n`

const rewriteSource = async (path: string) => {
  const code = await transformSource(path)
  if (!code) return
  const newFh = await promises.open(path, 'w')
  newFh.writeFile(importExpr + code.newSrc)
  // newFh.writeFile(code.newSrc)
  console.log(`${path} written`)
}

program.option('--dry')
const args = program.parse(process.argv)

args.args.forEach(program.opts().dry ? printDiff : rewriteSource)
