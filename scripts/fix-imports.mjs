#!/usr/bin/env node

import {
  readFileSync,
  writeFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  renameSync,
} from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { glob } from 'glob'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const distDir = join(__dirname, '../dist')
const appDir = join(__dirname, '../app')

// Função para corrigir importações em um arquivo
function fixImports(filePath) {
  let content = readFileSync(filePath, 'utf8')

  // Substitui importações específicas que precisam de .js
  content = content.replace(
    /from '\.\/http\/routes\/get-rooms'/g,
    "from './http/routes/get-rooms.js'"
  )
  content = content.replace(
    /from '\.\/http\/routes\/create-room'/g,
    "from './http/routes/create-room.js'"
  )
  content = content.replace(
    /from '\.\/http\/routes\/get-room-questions'/g,
    "from './http/routes/get-room-questions.js'"
  )
  content = content.replace(
    /from '\.\/http\/routes\/create-question'/g,
    "from './http/routes/create-question.js'"
  )
  content = content.replace(
    /from '\.\/http\/routes\/upload-audio'/g,
    "from './http/routes/upload-audio.js'"
  )
  content = content.replace(/from '\.\/env'/g, "from './env.js'")
  content = content.replace(
    /from '\.\.\/\.\.\/db\/connection'/g,
    "from '../../db/connection.js'"
  )
  content = content.replace(
    /from '\.\.\/\.\.\/db\/schema\/index'/g,
    "from '../../db/schema/index.js'"
  )
  content = content.replace(
    /from '\.\.\/\.\.\/services\/gemini'/g,
    "from '../../services/gemini.js'"
  )
  content = content.replace(/from '\.\/connection'/g, "from './connection.js'")
  content = content.replace(/from '\.\/schema'/g, "from './schema/index.js'")
  content = content.replace(
    /from '\.\/schema\/index'/g,
    "from './schema/index.js'"
  )
  content = content.replace(
    /from '\.\/audio-chunks'/g,
    "from './audio-chunks.js'"
  )
  content = content.replace(/from '\.\/questions'/g, "from './questions.js'")
  content = content.replace(/from '\.\/rooms'/g, "from './rooms.js'")

  writeFileSync(filePath, content, 'utf8')
}

// Encontra todos os arquivos .js no diretório dist
const jsFiles = glob.sync('**/*.js', { cwd: distDir, absolute: true })

// Corrige as importações em cada arquivo
for (const file of jsFiles) {
  fixImports(file)
}

process.stdout.write(`Fixed imports in ${jsFiles.length} files\n`)

// Cria a pasta app se não existir
if (!existsSync(appDir)) {
  mkdirSync(appDir, { recursive: true })
  process.stdout.write('Created app directory\n')
}

// Copia todos os arquivos de dist para app
cpSync(distDir, appDir, { recursive: true, force: true })
process.stdout.write('Copied dist files to app directory\n')

// Renomeia server.js para index.js na pasta app, se existir
const serverPath = join(appDir, 'server.js')
const indexPath = join(appDir, 'index.js')

if (existsSync(serverPath)) {
  renameSync(serverPath, indexPath)
  process.stdout.write('Renamed server.js to index.js in app directory\n')
} else {
  process.stdout.write('server.js not found in app directory\n')
}
