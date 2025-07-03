/**
 * @description
 * kaas
 *
 * @author Remco Stoeten

 */

import { TDocstringData, TDocstringTemplate, TProcessedTemplate } from '../types';

export function processTemplate(template: TDocstringTemplate, data: TDocstringData): TProcessedTemplate {
  let content = template.content;
  const tokens = [];

  content = content.replace('$DESCRIPTION', data.description);
  tokens.push({ token: '$DESCRIPTION', value: data.description });

  const emojiLine = data.emoji ? ` * ${data.emoji}\n *\n` : '';
  content = content.replace('$EMOJI_LINE', emojiLine);
  tokens.push({ token: '$EMOJI_LINE', value: emojiLine });

  const authorLine = data.author ? ` * @author ${data.author}\n` : '';
  content = content.replace('$AUTHOR_LINE', authorLine);
  tokens.push({ token: '$AUTHOR_LINE', value: authorLine });

  return { content, tokens };
}

