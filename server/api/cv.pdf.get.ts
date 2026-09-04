import { defineEventHandler, redirect } from 'h3'

/** The PDF is a static build artefact; this keeps a stable API-shaped URL for it. */
export default defineEventHandler(() => redirect('/hamed-niroomand-cv.pdf', 302))
