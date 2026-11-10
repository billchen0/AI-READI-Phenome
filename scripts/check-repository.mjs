import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
const privateDirectories =
  /(^|\/)(?:node_modules|dist|\.venv|\.herenow|\.local-notes|\.local-assets|\.agent-context|Datasets|local-preview)(\/|$)/
const dataExtensions = /\.(?:csv|tsv|hea|dat|parquet|npy|npz|dcm|sqlite|db|zip|gz)$/i
const tokenPattern =
  /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-[A-Za-z0-9]{24,})\b/
const userPathPattern = /\/Users\/[A-Za-z0-9_-]+\//
const failures = []

for (const file of files) {
  if (
    privateDirectories.test(file) ||
    dataExtensions.test(file) ||
    /(^|\/)preview\.json$/.test(file)
  ) {
    failures.push(`${file}: local data or build artifact`)
    continue
  }
  if (/(^|\/)\.env(?:\.|$)/.test(file) && file !== '.env.example') {
    failures.push(`${file}: environment file`)
    continue
  }
  if (/\.(?:glb|webp|png|jpg|jpeg)$/i.test(file)) continue
  const text = await readFile(file, 'utf8')
  if (tokenPattern.test(text)) failures.push(`${file}: possible access token`)
  if (userPathPattern.test(text)) failures.push(`${file}: machine-specific home path`)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  console.log(
    `Checked ${files.length} tracked files; no local data, environment files, or token patterns found.`,
  )
}
