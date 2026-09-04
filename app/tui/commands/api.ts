import type { AppCommand, PickerItem } from '../types'

const endpoints = [
  { name: 'cv', path: '/api/cv' },
  { name: 'experience', path: '/api/experience' },
  { name: 'skills', path: '/api/skills' },
  { name: 'projects', path: '/api/projects' },
] as const

const choices: PickerItem[] = endpoints.map(endpoint => ({
  value: endpoint.name,
  label: endpoint.name,
  description: endpoint.path,
}))

function pipeline(path: string): string {
  return `curl -s ${path} | jq .`
}

export default {
  name: 'api',
  description: 'Explore JSON API endpoints',
  args: '[endpoint]',
  complete: () => choices,
  run(argv, ctx) {
    const requested = argv[0]?.toLocaleLowerCase()
    if (!requested) {
      ctx.view.print(`API endpoints at ${ctx.env.siteUrl}:`)
      for (const endpoint of endpoints)
        ctx.view.print(`/api ${endpoint.name}  ${pipeline(endpoint.path)}`)
      return 0
    }

    const endpoint = endpoints.find(item => item.name === requested)
    if (!endpoint || argv.length > 1) {
      ctx.view.print(`api: unknown endpoint '${argv.join(' ')}' (try: ${endpoints.map(item => item.name).join(', ')})`, 'error')
      return 1
    }
    ctx.view.print(pipeline(endpoint.path))
    return 0
  },
} satisfies AppCommand
