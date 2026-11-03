// Generates the PNG icons used by HTML emails from the @cap-collectif/ui icon set.
// Email clients do not render SVG reliably, so icons are rasterized at 2x with headless Chrome.
// Usage: node scripts/generate-email-icons.cjs (set CHROME_PATH if Chrome is not in the default macOS location)
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const ui = require('@cap-collectif/ui')

const ROOT = path.resolve(__dirname, '..')
const OUTPUT_DIR = path.join(ROOT, 'public/image/email')
const CATEGORY_ICON_TABLE = path.join(ROOT, 'admin-next/shared/utils/convertIconToDs.tsx')
const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const GRAY_700 = '#545E68'
const GRAY_600 = '#6B7885'
const GRAY_300 = '#BEC4CB'
const GRAY_700_DARK_WATERMARK = '#4A535C'
const WHITE = '#FFFFFF'

const toIconName = dsName => dsName.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()

const renderSvg = (iconName, color) => {
  const html = renderToStaticMarkup(
    React.createElement(ui.CapUIProvider, null, React.createElement(ui.Icon, { name: iconName, size: 'md' })),
  )
  const svg = html.match(/<svg[\s\S]*<\/svg>/)
  if (!svg) throw new Error(`Unknown DS icon ${iconName}`)

  return svg[0]
    .replace(/currentColor/g, color)
    .replace(/ (width|height)="1em"/g, ' width="100%" height="100%"')
    .replace(/ (class|aria-hidden)="[^"]*"/g, '')
}

const rasterize = (fileName, { iconName, color, size, box = size, transform = '', offset = [0, 0] }) => {
  const htmlFile = path.join(os.tmpdir(), `email-icon-${process.pid}.html`)
  const [left, top] = offset
  fs.writeFileSync(
    htmlFile,
    `<html><body style="margin:0;background:transparent;overflow:hidden;width:${box}px;height:${box}px">` +
      `<div style="position:absolute;left:${left}px;top:${top}px;width:${size}px;height:${size}px;transform:${transform}">` +
      `${renderSvg(iconName, color)}</div></body></html>`,
  )
  execFileSync(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=2',
    '--default-background-color=00000000',
    `--window-size=${box},${box}`,
    `--screenshot=${path.join(OUTPUT_DIR, fileName)}`,
    `file://${htmlFile}`,
  ], { stdio: 'ignore' })
  fs.unlinkSync(htmlFile)
}

const ACTIVITY_ICONS = {
  votes: 'THUMB_UP_O',
  comments: 'BUBBLE_O',
  step: 'FLAG_O',
  // The DS has no stamp icon yet: the gavel is the closest official response pictogram.
  'official-response': 'MODERATE',
  news: 'NEWSPAPER',
}

fs.mkdirSync(path.join(OUTPUT_DIR, 'category'), { recursive: true })

for (const [fileName, iconName] of Object.entries(ACTIVITY_ICONS)) {
  rasterize(`activity-${fileName}.png`, { iconName, color: GRAY_700, size: 20 })
  rasterize(`activity-${fileName}-dark.png`, { iconName, color: GRAY_300, size: 20 })
}
rasterize('author.png', { iconName: 'USER_O', color: GRAY_600, size: 16 })
rasterize('author-dark.png', { iconName: 'USER_O', color: GRAY_300, size: 16 })
rasterize('news-placeholder.png', { iconName: 'NEWSPAPER', color: WHITE, size: 32 })

// Project watermark: tilted to the right and cut by the top right corner of the project block.
const watermark = { iconName: 'PROJECT', size: 96, box: 88, transform: 'rotate(15deg)', offset: [16, -24] }
rasterize('project-watermark.png', { ...watermark, color: WHITE })
rasterize('project-watermark-dark.png', { ...watermark, color: GRAY_700_DARK_WATERMARK })

const categoryTable = fs.readFileSync(CATEGORY_ICON_TABLE, 'utf8')
for (const [, key, dsName] of categoryTable.matchAll(/^\s+([A-Z_]+) = '(\w+)',$/gm)) {
  const fileName = key.toLowerCase().replace(/_/g, '-')
  rasterize(`category/${fileName}.png`, { iconName: toIconName(dsName), color: WHITE, size: 48 })
}
