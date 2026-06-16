import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const lucide = require('lucide')

const iconNames = Object.entries(lucide)
  .filter(([, v]) => Array.isArray(v))
  .map(([k]) => k)
  .sort()

function pascalToKebab(name) {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .replace(/(\d)([a-zA-Z])/g, '$1-$2')
    .replace(/[A-Z]{2,}$/g, (m) => m.split('').join('-'))
    .toLowerCase()
}

// Group icons by their kebab-case filename (handles case-insensitive FS collisions)
const groups = new Map()
for (const name of iconNames) {
  const file = pascalToKebab(name)
  if (!groups.has(file)) groups.set(file, [])
  groups.get(file).push(name)
}

const outDir = 'src/icons'
rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

// Generate individual icon files
for (const [file, names] of groups) {
  const primary = names[0]
  const aliases = names.slice(1)
  const iconData = JSON.stringify(lucide[primary])
  const lines = [
    `import type { IconNode } from 'lucide'`,
    `import { createIcon } from '../create-icon.js'`,
    `const iconNode: IconNode = ${iconData}`,
    `export const ${primary} = createIcon(iconNode)`,
    ...aliases.map((alias) => `export const ${alias} = ${primary}`),
    '',
  ]
  writeFileSync(`${outDir}/${file}.ts`, lines.join('\n'))
}

// Generate barrel index
const barrelLines = [
  '// This file is auto-generated. Do not edit manually.',
  ...iconNames.map((name) => {
    const file = pascalToKebab(name)
    return `export { ${name} } from './${file}.js'`
  }),
  '',
]
writeFileSync(`${outDir}/index.ts`, barrelLines.join('\n'))

// Remove old single file if it exists
try { rmSync('src/icons.ts', { force: true }) } catch {}

console.log(`Generated ${groups.size} icon files in src/icons/ (${iconNames.length} exports)`)
