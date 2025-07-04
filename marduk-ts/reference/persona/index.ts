
/**
 * Marduk Persona Reference System
 * 
 * This module serves as a registry and access point for various versions
 * of the Marduk persona specifications and characteristics.
 * 
 * The personas are stored in markdown format for human readability while
 * providing programmatic access through this interface.
 */

import fs from 'fs';
import path from 'path';
import { logger } from '../../core/utils/logger.js';

export interface PersonaVersion {
  version: string;
  path: string;
  description: string;
  created: Date;
}

const personaRegistry: Record<string, PersonaVersion> = {
  'v0': {
    version: 'v0',
    path: './marduk-v0.md',
    description: 'Original Marduk the Mad Scientist persona specification',
    created: new Date('2023-12-01')
  },
  'v1': {
    version: 'v1',
    path: './marduk-v1.md',
    description: 'Condensed Marduk the Mad Scientist persona specification',
    created: new Date('2024-06-08')
  },
  'v15': {
    version: 'v15',
    path: './marduk-v15.md',
    description: 'Enhanced Marduk as a Cognitive Systems Architect',
    created: new Date('2024-06-09')
  }
};

/**
 * Retrieves the content of a specific Marduk persona version
 */
export function getPersonaContent(version: string = 'v0'): string | null {
  try {
    const personaInfo = personaRegistry[version];
    if (!personaInfo) {
      logger.warn(`Persona version ${version} not found in registry`);
      return null;
    }
    
    const filePath = path.join(__dirname, personaInfo.path);
    if (!fs.existsSync(filePath)) {
      logger.error(`Persona file not found: ${filePath}`);
      return null;
    }
    
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    logger.error('Error retrieving persona content:', error);
    return null;
  }
}

/**
 * Lists all available Marduk persona versions
 */
export function listPersonaVersions(): PersonaVersion[] {
  return Object.values(personaRegistry);
}

/**
 * Gets information about a specific persona version
 */
export function getPersonaInfo(version: string = 'v0'): PersonaVersion | null {
  return personaRegistry[version] || null;
}
