import { statSync, writeFileSync, readFileSync } from '@zos/fs'

export function readJsonFile(path, defaultValue = null) {
  const fStat = statSync({ path })
  if (!fStat) {
    return defaultValue
  }

  try {
    const raw = readFileSync({
      path,
      options: { encoding: 'utf8' }
    })
    return raw ? JSON.parse(raw) : defaultValue
  } catch (error) {
    return defaultValue
  }
}

export function writeJsonFile(path, data) {
  writeFileSync({
    path,
    data: JSON.stringify(data),
    options: { encoding: 'utf8' }
  })
}
