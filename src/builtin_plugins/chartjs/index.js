const pug = require('pug')
const fs = require('fs').promises
const path = require('path')

exports.constructor = async function (params) {
  return {
    watchers: [
      {
        extensions: ['.chart.js'],
        handler: chartjsHandler
      }
    ]
  }
}

const chartjsHandler = async function (chartjsPath, page) {
  const chartSpec = await fs.readFile(chartjsPath, 'utf8')
  const html = pug.renderFile(path.join(__dirname, 'template.pug'), { chartSpec })
  const tempHTML = `${chartjsPath}.htm`

  await fs.writeFile(tempHTML, html)
  await page.setContent(html)
  await page.waitForFunction(() => window.pngData)

  const dataUrl = await page.evaluate(() => window.pngData)
  const { buffer } = parseDataUrl(dataUrl)
  const { dir, name } = path.parse(chartjsPath)
  const pngPath = path.join(dir, `${name}.png`)
  await fs.writeFile(pngPath, buffer, 'base64')
}

const parseDataUrl = function (dataUrl) {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/)
  return {
    mime: matches[1],
    buffer: Buffer.from(matches[2], 'base64')
  }
}
