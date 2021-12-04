const hyphenopoly = require('hyphenopoly');

const HYPHEN_PLACEHOLDER = '\u0000';
const HYPHEN_MARKER = '&shy;';

const hyphenator = hyphenopoly.config({
  require: ['de', 'en-us'],
  hyphen: HYPHEN_PLACEHOLDER
});

async function hyphenate(text) {
  const hyphenateText = await hyphenator.get('de');
  const pattern = new RegExp(HYPHEN_PLACEHOLDER, 'g');
  let result = hyphenateText(text);
  return result.replace(pattern, HYPHEN_MARKER);
}

module.export = hyphenate;
