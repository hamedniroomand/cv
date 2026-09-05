import type { CvData } from '#shared/schemas/cv';

export const fixtureCv: CvData = {
  profile: {
    name: 'Hamed Niroomand',
    title: 'Frontend Team Lead / Senior TypeScript Engineer',
    tagline: 'Ships TypeScript.',
    location: { city: 'Yerevan', country: 'Armenia', tz: 'UTC+4' },
    remote: true,
    languages: [
      { name: 'Persian', level: 'native' },
      { name: 'English', level: 'professional' },
    ],
    links: {
      github: 'hamedniroomand',
      linkedin: 'https://linkedin.com/in/example',
      email: 'me@example.com',
    },
    summary: 'Frontend lead with seven years in production.',
    description: 'Frontend lead. This resume has a terminal.',
  },
  about: {
    body: 'About paragraph one.\n\nAbout paragraph two.',
    html: '<p>About paragraph one.</p>\n<p>About paragraph two.</p>\n',
  },
  experience: [
    {
      slug: 'acme',
      company: 'Acme',
      url: 'https://acme.test',
      location: 'Remote',
      type: 'full-time',
      roles: [
        { title: 'Team Lead', start: '2022-09', end: '2026-08' },
        { title: 'Senior Developer', start: '2022-01', end: '2022-09' },
      ],
      stack: ['Vue 3', 'Nuxt 4'],
      order: 1,
      body: 'Acme builds widgets.',
      html: '<p>Acme builds widgets.</p>\n',
      highlights: [
        {
          slug: 'shipped',
          title: 'Shipped the thing',
          order: 1,
          body: 'Shipped the thing to production.',
          html: '<p>Shipped the thing to production.</p>\n',
        },
      ],
    },
    {
      slug: 'globex',
      company: 'Globex',
      location: 'Iran',
      type: 'part-time',
      roles: [{ title: 'Web Developer', start: '2019-05', end: '2021-07' }],
      stack: ['Laravel'],
      order: 2,
      body: 'Globex does SEO.',
      html: '<p>Globex does SEO.</p>\n',
      highlights: [],
    },
  ],
  projects: [
    {
      slug: 'cue',
      name: 'Cue',
      repo: 'hamedniroomand/cue',
      docs: 'https://hamedniroomand.github.io/cue',
      tagline: 'Drive coding agents from GitHub labels.',
      stack: ['TypeScript', 'Bun'],
      body: '# Cue\n\nFallback readme.',
      html: '<h1>Cue</h1>\n<p>Fallback readme.</p>\n',
      readmeSource: 'fallback',
    },
  ],
  skills: {
    categories: [
      { id: 'frontend', label: 'Frontend', items: [{ name: 'Vue 3' }, { name: 'Nuxt 4' }] },
      {
        id: 'backend',
        label: 'Backend',
        items: [{ name: 'Bun' }, { name: 'NestJS', note: 'APIs' }],
      },
    ],
  },
  education: {
    institution: 'Khayyam University',
    degree: 'B.Sc.',
    field: 'Mechanical Engineering',
    location: 'Mashhad, Iran',
    start: '2018-09',
    end: '2022-06',
    body: 'Studied while working.',
    html: '<p>Studied while working.</p>\n',
  },
  secrets: { body: '- Secret one.\n- Secret two.' },
  generatedAt: '2026-09-04T00:00:00.000Z',
};
