import React from 'react';

/** Arabic runs (letters and marks, with the spaces between them). */
const ARABIC_RUN = /([؀-ۿ](?:[؀-ۿ\s]*[؀-ۿ])?)/;

/**
 * Text that mixes English and Arabic: each Arabic run is isolated in a <bdi lang="ar">, so the
 * surrounding punctuation stays in place and the browser does not reorder the sentence.
 */
const WithArabic: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(ARABIC_RUN).map((part, i) =>
      i % 2 === 1 ? (
        <bdi key={i} lang="ar" className="font-arabic text-[1.15em]">
          {part}
        </bdi>
      ) : (
        part
      ),
    )}
  </>
);

export default WithArabic;
