/**
 * Template Loader
 *
 * Loads YAML narrative templates from the templates directory.
 */

import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import * as yaml from 'yaml'
import type { NarrativeTemplate } from './types'

/**
 * In-memory template cache.
 */
const templateCache: Map<string, NarrativeTemplate> = new Map()

/**
 * Load a narrative template by modality and language.
 *
 * @param modality Modality identifier (e.g., "oct", "vis", "dexa")
 * @param language Language code (default: "en")
 * @param templatesDir Path to templates directory
 * @returns Parsed narrative template
 * @throws Error if template file not found or invalid
 */
export function loadTemplate(
  modality: string,
  language: string = 'en',
  templatesDir: string = join(__dirname, '../templates')
): NarrativeTemplate {
  const cacheKey = `${modality}.${language}`

  // Check cache first
  if (templateCache.has(cacheKey)) {
    return templateCache.get(cacheKey)!
  }

  // Build filename (e.g., "oct.v1.en.yaml" or "oct.v1.yaml")
  const filenames = [
    `${modality}.v1.${language}.yaml`,
    `${modality}.v1.yaml`, // Fallback to default
  ]

  let content: string | null = null
  for (const filename of filenames) {
    const filepath = join(templatesDir, filename)
    try {
      content = readFileSync(filepath, 'utf-8')
      break
    } catch (err) {
      // Try next filename
      continue
    }
  }

  if (!content) {
    throw new Error(`Template not found for modality "${modality}" language "${language}"`)
  }

  // Parse YAML
  const template = yaml.parse(content) as NarrativeTemplate

  // Validate structure
  if (!template.modality || !template.version || !template.steps) {
    throw new Error(`Invalid template structure for ${modality}`)
  }

  // Cache and return
  templateCache.set(cacheKey, template)
  return template
}

/**
 * Load all available templates.
 *
 * @param templatesDir Path to templates directory
 * @returns Map of modality → template
 */
export function loadAllTemplates(
  templatesDir: string = join(__dirname, '../templates')
): Map<string, NarrativeTemplate> {
  const templates = new Map<string, NarrativeTemplate>()

  try {
    const files = readdirSync(templatesDir)

    for (const file of files) {
      if (!file.endsWith('.yaml')) continue

      // Parse filename: modality.v1.yaml or modality.v1.lang.yaml
      const parts = file.replace('.yaml', '').split('.')
      const modality = parts[0]

      try {
        const template = loadTemplate(modality, 'en', templatesDir)
        templates.set(modality, template)
      } catch (err) {
        console.warn(`Failed to load template ${file}:`, err)
      }
    }
  } catch (err) {
    console.warn('Failed to read templates directory:', err)
  }

  return templates
}

/**
 * Clear template cache (useful for testing).
 */
export function clearTemplateCache(): void {
  templateCache.clear()
}
