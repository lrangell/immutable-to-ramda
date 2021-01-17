import {run, visit} from 'recast'
import transformers from './transformers'

run(function(ast, callback) {
  visit(ast, transformers);
  callback(ast)
})

