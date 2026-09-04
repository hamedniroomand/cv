import type { CvData } from '../../shared/schemas/cv.ts'
import process from 'node:process'
import { addTemplate, addTypeTemplate, createResolver, defineNuxtModule, updateTemplates, useLogger } from '@nuxt/kit'
import { fetchGithubReadme } from './cue-readme.ts'
import { loadContent } from './load.ts'

/**
 * Reads `content/`, validates it with the shared Zod schemas, fetches project READMEs from GitHub
 * (falling back to the committed body) and exposes everything as the virtual module `#cv`.
 */
export default defineNuxtModule({
  meta: { name: 'cv-content' },
  async setup(_options, nuxt) {
    const logger = useLogger('cv-content')
    const contentDir = createResolver(nuxt.options.rootDir).resolve('content')
    const offline = process.env.CV_OFFLINE === '1'
    const fetcher = offline ? async () => null : fetchGithubReadme

    let data: CvData = await loadContent(contentDir, fetcher)
    for (const p of data.projects)
      logger.info(`project ${p.slug}: README from ${p.readmeSource}`)

    const template = addTemplate({
      filename: 'cv-data.mjs',
      write: true,
      getContents: () => `export const cv = ${JSON.stringify(data)}\n`,
    })
    addTypeTemplate({
      filename: 'types/cv-data.d.ts',
      getContents: () => [
        `declare module '#cv' {`,
        `  import type { CvData } from '../../shared/schemas/cv.ts'`,
        `  export const cv: CvData`,
        `}`,
        ``,
      ].join('\n'),
    })

    nuxt.options.alias['#cv'] = template.dst
    nuxt.hook('nitro:config', (config) => {
      config.alias ||= {}
      config.alias['#cv'] = template.dst
    })

    nuxt.options.watch.push(contentDir)
    nuxt.hook('builder:watch', async (_event, path) => {
      if (!path.includes('content'))
        return
      try {
        data = await loadContent(contentDir, fetcher)
        await updateTemplates({ filter: t => t.filename === 'cv-data.mjs' })
        logger.success('content reloaded')
      }
      catch (err) {
        logger.error(err)
      }
    })
  },
})
