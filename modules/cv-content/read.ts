import { readdir, readFile } from 'node:fs/promises';

import { z } from 'zod';

import { ContentError } from './errors.ts';
import type { Frontmatter } from './frontmatter.ts';
import { parseFrontmatter } from './frontmatter.ts';

export function validate<T>(schema: z.ZodType<T>, value: unknown, file: string): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new ContentError(file, z.prettifyError(result.error));
  return result.data;
}

export function slugOf(fileName: string): string {
  return fileName.replace(/\.md$/, '');
}

export function byOrder<T extends { order: number }>(a: T, b: T): number {
  return a.order - b.order;
}

export async function readText(path: string): Promise<string> {
  return readFile(path, 'utf8');
}

export async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readText(path));
}

export async function readMarkdown(path: string): Promise<Frontmatter> {
  return parseFrontmatter(await readText(path));
}

export async function listDirs(path: string): Promise<string[]> {
  const entries = await readdir(path, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
}

export async function listMarkdown(path: string): Promise<string[]> {
  try {
    const entries = await readdir(path, { withFileTypes: true });
    return entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
      .map(entry => entry.name)
      .sort();
  } catch {
    return [];
  }
}
