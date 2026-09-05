import { defineEventHandler } from 'nitro/h3';

import { getPublicCv } from '#server/utils/cv';

export default defineEventHandler(() => getPublicCv());
