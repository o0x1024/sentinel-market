#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const skillsDir = path.join(repoRoot, 'skills')
const manifestPath = path.join(skillsDir, 'skills.json')

function isIgnoredName(name) {
  const lower = name.toLowerCase()
  return (
    lower.startsWith('.git') ||
    lower === 'node_modules' ||
    lower === '.venv' ||
    lower === 'venv' ||
    lower === '__pycache__' ||
    lower === '.pytest_cache' ||
    lower === '.ds_store' ||
    lower === '.smoke' ||
    lower === 'post-distillation'
  )
}

function parseFrontmatter(markdown) {
  const trimmed = markdown.trimStart()
  if (!trimmed.startsWith('---')) {
    throw new Error('SKILL.md missing YAML frontmatter')
  }
  const lines = trimmed.split(/\r?\n/)
  if (lines[0].trim() !== '---') {
    throw new Error("SKILL.md frontmatter start must be '---'")
  }
  let endIdx = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      endIdx = i
      break
    }
  }
  if (endIdx === -1) {
    throw new Error("SKILL.md frontmatter end '---' not found")
  }
  const yamlLines = lines.slice(1, endIdx)
  const data = {}
  let currentKey = null
  let blockLines = []

  const flushBlock = () => {
    if (currentKey && blockLines.length > 0) {
      data[currentKey] = blockLines.join('\n').trim()
      currentKey = null
      blockLines = []
    }
  }

  for (const line of yamlLines) {
    const versionMatch = line.match(/^\s+version:\s*["']?([^"'\n]+)["']?\s*$/)
    if (versionMatch && !data.version) {
      data.version = versionMatch[1].trim()
      continue
    }
    const topMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/)
    if (topMatch) {
      flushBlock()
      const key = topMatch[1]
      const rawVal = topMatch[2].trim()
      if (rawVal === '|' || rawVal === '>') {
        currentKey = key
        blockLines = []
      } else {
        data[key] = rawVal.replace(/^["']|["']$/g, '')
      }
    } else if (currentKey) {
      blockLines.push(line.replace(/^\s{2}/, ''))
    }
  }
  flushBlock()
  return data
}

function collectFiles(skillDir, relPrefix = '') {
  const results = []
  const entries = fs.readdirSync(skillDir, { withFileTypes: true })
  for (const entry of entries) {
    if (isIgnoredName(entry.name) || entry.isSymbolicLink()) continue
    const relPath = relPrefix ? `${relPrefix}/${entry.name}` : entry.name
    const fullPath = path.join(skillDir, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, relPath))
    } else if (entry.isFile()) {
      const stat = fs.statSync(fullPath)
      results.push({
        path: relPath,
        size: stat.size,
      })
    }
  }
  results.sort((a, b) => a.path.localeCompare(b.path))
  return results
}

const DEFAULT_TAGS = {
  'ego-browser': ['browser', 'automation', 'web', 'testing'],
  'game-dev': ['game', 'html5', 'canvas', 'frontend'],
  'sentinel-slides': ['presentation', 'pptx', 'pptd', 'office'],
  'security-research': ['security', 'bounty', 'src', 'vuln-hunting'],
  'src-vuln-hunting': ['security', 'bounty', 'src', 'vuln-hunting'],
}

function buildManifest() {
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true })
  const skills = []

  for (const entry of entries) {
    if (!entry.isDirectory() || isIgnoredName(entry.name)) continue
    const skillId = entry.name
    const skillDir = path.join(skillsDir, skillId)
    const skillMdPath = path.join(skillDir, 'SKILL.md')
    if (!fs.existsSync(skillMdPath)) continue

    const markdown = fs.readFileSync(skillMdPath, 'utf8')
    const fm = parseFrontmatter(markdown)
    const files = collectFiles(skillDir)

    skills.push({
      id: skillId,
      name: fm.name || skillId,
      description: fm.description || '',
      version: fm.version || '1.0.0',
      author: fm.author || 'Sentinel',
      tags: DEFAULT_TAGS[skillId] || ['skill'],
      files,
    })
  }

  skills.sort((a, b) => a.id.localeCompare(b.id))

  const manifest = {
    version: '1.0.0',
    updated_at: new Date().toISOString().slice(0, 10),
    skills,
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
  console.log(`Generated ${manifestPath} with ${skills.length} skills.`)
}

buildManifest()
