import * as yaml from 'js-yaml';

export interface FrontMatter {
  [key: string]: any;
}

export interface ParsedContent {
  frontMatter: FrontMatter;
  content: string;
}

/**
 * Parse YAML front matter from a markdown file
 * @param text - The markdown text with front matter
 * @returns An object with frontMatter and content, or null if parsing fails
 */
export function parseFrontMatter(text: string): ParsedContent | null {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = text.match(frontMatterRegex);

  if (!match) {
    // No front matter found, return empty front matter and full content
    return {
      frontMatter: {},
      content: text,
    };
  }

  try {
    const frontMatterText = match[1];
    const content = match[2];

    const frontMatter = yaml.load(frontMatterText) as FrontMatter;

    if (typeof frontMatter !== 'object' || frontMatter === null) {
      return {
        frontMatter: {},
        content: text,
      };
    }

    return {
      frontMatter,
      content,
    };
  } catch (error) {
    console.error('Failed to parse front matter:', error);
    return {
      frontMatter: {},
      content: text,
    };
  }
}

