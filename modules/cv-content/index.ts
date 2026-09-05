import process from 'node:process';

import {
  addTemplate,
  addTypeTemplate,
  defineNuxtModule,
  updateTemplates,
  useLogger,
} from '@nuxt/kit';
import type { Nuxt } from '@nuxt/schema';
import { join } from 'pathe';

import { DOTFILES_INDEX, dotfilePath } from '#shared/cv/panel-target';
import type { CvData } from '#shared/schemas/cv';

import { fetchGist, fetchGithubReadme } from './github.ts';
import { highlight } from './highlight.ts';
import type { LoadDeps } from './load.ts';
import { loadContent } from './load.ts';

const DATA_TEMPLATE = 'cv-data.mjs';

const CV_TYPES = [
  `declare module '#cv' {`,
  `  import type { CvData } from '#shared/schemas/cv'`,
  `  export const cv: CvData`,
  `}`,
  ``,
].join('\n');

function loadDeps(): LoadDeps {
  const offline = process.env.CV_OFFLINE === '1';
  const token = process.env.GITHUB_TOKEN;
  return {
    fetchReadme: offline ? async () => null : fetchGithubReadme,
    fetchGist: offline ? async () => null : (id, file) => fetchGist(id, file, { token }),
    highlight,
  };
}

function registerPrerenderRoutes(nuxt: Nuxt, data: CvData): void {
  nuxt.options.nitro.prerender ||= {};
  const routes = new Set(nuxt.options.nitro.prerender.routes ?? []);
  routes.add(DOTFILES_INDEX);
  for (const dotfile of data.dotfiles) routes.add(dotfilePath(dotfile.slug));
  nuxt.options.nitro.prerender.routes = [...routes];
}

function logSources(logger: ReturnType<typeof useLogger>, data: CvData): void {
  for (const project of data.projects)
    logger.info(`project ${project.slug}: README from ${project.readmeSource}`);
  for (const dotfile of data.dotfiles)
    logger.info(`dotfile ${dotfile.slug}: content from ${dotfile.source}`);
}

function registerCvAlias(nuxt: Nuxt, dst: string): void {
  nuxt.options.alias['#cv'] = dst;
  nuxt.hook('nitro:config', config => {
    config.alias ||= {};
    config.alias['#cv'] = dst;
  });
}

function watchContent(nuxt: Nuxt, contentDir: string, reload: () => Promise<void>): void {
  nuxt.options.watch.push(contentDir);
  nuxt.hook('builder:watch', async (_event, path) => {
    if (path.includes('content')) await reload();
  });
}

export default defineNuxtModule({
  meta: { name: 'cv-content' },
  async setup(_options, nuxt) {
    const logger = useLogger('cv-content');
    const contentDir = join(nuxt.options.rootDir, 'content');
    const deps = loadDeps();

    let data: CvData = await loadContent(contentDir, deps);
    logSources(logger, data);
    registerPrerenderRoutes(nuxt, data);

    const template = addTemplate({
      filename: DATA_TEMPLATE,
      write: true,
      getContents: () => `export const cv = ${JSON.stringify(data)}\n`,
    });
    addTypeTemplate(
      { filename: 'types/cv-data.d.ts', getContents: () => CV_TYPES },
      { nuxt: true, nitro: true },
    );
    registerCvAlias(nuxt, template.dst);

    watchContent(nuxt, contentDir, async () => {
      try {
        data = await loadContent(contentDir, deps);
        await updateTemplates({ filter: entry => entry.filename === DATA_TEMPLATE });
        logger.success('content reloaded');
      } catch (err) {
        logger.error(err);
      }
    });
  },
});
