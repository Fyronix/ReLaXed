#!/usr/bin/env node

const colors = require('colors');
const program = require('commander');
const path = require('path');
const { spawn } = require('child_process');
const version = require('../../package.json').version;

let input, output;

program
  .version('From ReLaXed ' + version)
  .usage('<input> [output] [options]')
  .arguments('<input> [output] [options]')
  .option('-w, --width <width>', 'Width in pixels (default: 400)', parseInt)
  .option('-d, --delay <delay>', 'Delay between frames (default: 1.0)', parseFloat)
  .option('-c, --colors <colors>', 'Number of colors (default: 256)', parseInt)
  .action(function (inp, out) {
    input = inp;
    output = out;
  });

program.parse(process.argv);

if (!input) {
  console.error('Error: missing required argument \'input\'');
  program.help();
}

output = output || (input.slice(0, input.length - 4) + '.gif');
const width = program.width || 400;
const delay = 100 * (program.delay || 1.0);
const ncolors = program.colors || 256;

const subprocess = spawn('convert', [
  '-delay', delay,
  '-resize', `${width}x`,
  '-colors', ncolors,
  '-layers', 'optimize',
  input,
  output
]);

subprocess.stdout.on('data', function (data) {
  console.log(data.toString().trim());
});

subprocess.stderr.on('data', function (data) {
  console.error(data.toString().trim());
});

subprocess.on('close', function (code) {
  if (code) {
    console.error(`Error: convert exited with code ${code}`);
  } else {
    console.log('Conversion complete');
  }
});
