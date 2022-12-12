import { program } from 'commander';
import { printDiff, rewriteSource } from './utils';

program.option('--dry');
const args = program.parse(process.argv);

args.args.forEach(program.opts().dry ? printDiff : rewriteSource);
