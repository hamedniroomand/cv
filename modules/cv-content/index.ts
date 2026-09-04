import type { Nuxt } from '@nuxt/schema'
import type { CvData } from '#shared/schemas/cv'
import type { ReadmeFetcher } from './load.ts'
import process from 'node:process'
import { addTemplate, addTypeTemplate, defineNuxtModule, updateTemplates, useLogger } from '@nuxt/kit'
import { join } from 'pathe'
import { fetchGithubReadme } from './cue-readme.ts'
import { loadContent } from './load.ts'

const DATA_TEMPLATE = 'cv-data.mjs'

const CV_TYPES = [
  `declare module '#cv' {`,
  `  import type { CvData } from '#shared/schemas/cv'`,
  `  export const cv: CvData`,
  `}`,
  ``,
].join('\n')

function readmeFetcher(): ReadmeFetcher {
  return process.env.CV_OFFLINE === '1' ? async () => null : fetchGithubReadme
}

function registerCvAlias(nuxt: Nuxt, dst: string): void {
  nuxt.options.alias['#cv'] = dst
  nuxt.hook('nitro:config', (config) => {
    config.alias ||= {}
    config.alias['#cv'] = dst
  })
}

function watchContent(nuxt: Nuxt, contentDir: string, reload: () => Promise<void>): void {
  nuxt.options.watch.push(contentDir)
  nuxt.hook('builder:watch', async (_event, path) => {
    if (path.includes('content'))
      await reload()
  })
}

export default defineNuxtModule({
  meta: { name: 'cv-content' },
  async setup(_options, nuxt) {
    const logger = useLogger('cv-content')
    const contentDir = join(nuxt.options.rootDir, 'content')
    const fetcher = readmeFetcher()

    let data: CvData = await loadContent(contentDir, fetcher)
    for (const project of data.projects)
      logger.info(`project ${project.slug}: README from ${project.readmeSource}`)

    const template = addTemplate({
      filename: DATA_TEMPLATE,
      write: true,
      getContents: () => `export const cv = ${JSON.stringify(data)}\n`,
    })
    addTypeTemplate({ filename: 'types/cv-data.d.ts', getContents: () => CV_TYPES }, { nuxt: true, nitro: true })
    registerCvAlias(nuxt, template.dst)

    watchContent(nuxt, contentDir, async () => {
      try {
        data = await loadContent(contentDir, fetcher)
        await updateTemplates({ filter: entry => entry.filename === DATA_TEMPLATE })
        logger.success('content reloaded')
      }
      catch (err) {
        logger.error(err)
      }
    })
  },
})
