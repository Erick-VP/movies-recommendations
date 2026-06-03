let cachedEnv = null

function parseEnv(content) {
  return content.split('\n').reduce((env, line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return env

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) return env

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '')
    env[key] = value
    return env
  }, {})
}

async function loadEnv() {
  if (cachedEnv) return cachedEnv

  const envUrl = new URL('../../.env', import.meta.url)
  const response = await fetch(envUrl)

  if (!response.ok) {
    throw new Error('Arquivo .env não encontrado na raiz do projeto.')
  }

  cachedEnv = parseEnv(await response.text())
  return cachedEnv
}

// Carrega o token de leitura do TMDB a partir do arquivo .env.
export async function getApiReadKey() {
  const env = await loadEnv()
  const apiKey = env.TMDB_API_READ_KEY || env.API_READ_KEY || env.TMDB_API_KEY

  if (!apiKey) {
    throw new Error('Defina TMDB_API_READ_KEY no arquivo .env.')
  }

  return apiKey
}
