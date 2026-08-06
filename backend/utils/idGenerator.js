const crypto = require('crypto');

/**
 * Identifier Standard Generator (Chapter 3 Section 3.16)
 * Prefixes: proj_, analysis_, caption_, idea_
 */
const generateId = (prefix = 'proj') => {
  const randomHex = crypto.randomBytes(8).toString('hex');
  return `${prefix}_${randomHex}`;
};

module.exports = {
  generateId,
  generateProjectId: () => generateId('proj'),
  generateAnalysisId: () => generateId('analysis'),
  generateCaptionId: () => generateId('caption'),
  generateIdeaId: () => generateId('idea')
};
