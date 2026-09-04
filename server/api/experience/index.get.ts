import { defineEventHandler } from 'nitro/h3'
import { getPublicCv } from '../../utils/cv'

export default defineEventHandler(() => getPublicCv().experience)
