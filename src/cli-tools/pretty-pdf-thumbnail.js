#!/usr/bin/env node

const colors = require('colors')
const program = require('commander')
const path = require('path')
const { spawn } = require('child_process')
const version = require('../../package.json').version

let input, output, shadow

program
  .version('From ReLaXed ' + version)
  .usage('<input> [output] [options]')
  .arguments('<input> [output] [options]')
  .option('--size, -s', 'size of output image in pixels', 600)
  .option('--shadow, -w', 'size of shadow in pixels', 15)
  .action(function (inp, out) {
    input = inp
    output = out || `${path.basename(input, path.extname(input))}.png`
  })

program.parse(process.argv)

const subprocess = spawn('convert', [
  '-density', '300',
  input + '[0]',
  '-resize', `${program.size - 4 * program.shadow}x${program.size - 4 * program.shadow}`,
  '(',
  '+clone',
  '-background', 'black',
  '-shadow', `${program.shadow}x${program.shadow}+1+1`,
  ')',
  '+swap',
  '-background', 'white',
  '-layers', 'merge',
  '+repage',
  output
])

subprocess.stdout.on('data', function (data) {
  console.log(data.toString())
})

subprocess.stderr.on('data', function (data) {
  console.error(data.toString())
})

subprocess.on('close', function (code) {
  if (code) {
    console.error(`Process exited with code ${code}`)
  } else {
    console.log(`Saved image as ${output}`)
  }
})
