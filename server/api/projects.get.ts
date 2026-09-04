import { defineEventHandler } from 'h3'
import { getPublicCv } from '../utils/cv'

export default defineEventHandler(() => getPublicCv().projects)
