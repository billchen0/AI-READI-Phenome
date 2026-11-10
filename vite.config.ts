import { readFile } from 'node:fs/promises'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const LOCAL_PREVIEW_ROUTE = '/__local_preview'

function sendJson(
  res: import('node:http').ServerResponse,
  status: number,
  body: Record<string, unknown>,
): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.end(JSON.stringify(body))
}

/**
 * Dev-only endpoint. The path comes from the local environment and is never
 * exposed to the client bundle. No preview payload is written into this repo.
 */
function localPreviewPlugin(previewPath: string | undefined): Plugin {
  return {
    name: 'ai-readi-local-preview',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(LOCAL_PREVIEW_ROUTE, async (req, res) => {
        if (req.method !== 'GET') {
          res.setHeader('Allow', 'GET')
          sendJson(res, 405, { error: 'Method not allowed' })
          return
        }

        if (!previewPath) {
          sendJson(res, 503, {
            error: 'Local preview is not configured',
            detail:
              'Set AI_READI_PREVIEW_JSON to an external preview JSON file and restart the dev server.',
          })
          return
        }

        try {
          const raw = await readFile(previewPath, 'utf8')
          const parsed: unknown = JSON.parse(raw)
          const modalities =
            typeof parsed === 'object' && parsed !== null
              ? (parsed as { modalities?: unknown }).modalities
              : undefined
          if (typeof modalities !== 'object' || modalities === null || Array.isArray(modalities)) {
            sendJson(res, 503, { error: 'Local preview has an invalid shape' })
            return
          }
          sendJson(res, 200, parsed as Record<string, unknown>)
        } catch (error) {
          const code = (error as NodeJS.ErrnoException).code
          if (code === 'ENOENT') {
            sendJson(res, 404, { error: 'Local preview file not found' })
            return
          }
          if (error instanceof SyntaxError) {
            sendJson(res, 503, { error: 'Local preview is not valid JSON' })
            return
          }
          sendJson(res, 503, { error: 'Local preview could not be read' })
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const previewPath = env.AI_READI_PREVIEW_JSON || process.env.AI_READI_PREVIEW_JSON

  return {
    plugins: [
      react(),
      localPreviewPlugin(
        (env.VITE_AI_READI_LOCAL || process.env.VITE_AI_READI_LOCAL) === '1'
          ? previewPath
          : undefined,
      ),
    ],
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
    },
    preview: {
      host: '127.0.0.1',
      port: 4173,
      strictPort: true,
    },
    build: {
      sourcemap: false,
    },
  }
})
