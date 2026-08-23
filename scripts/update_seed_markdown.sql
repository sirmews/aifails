UPDATE confessions
SET prompt_used = 'Convert this date string `2026-08-22` to a human-readable format like `August 22, 2026` in TypeScript.',
    what_it_did_instead = 'Wrote a 140-line custom regex lexer with an enum of Roman numerals and imported a deprecated lunar calendar library:

```
import { LunarCalendar } from ''deprecated-lunar-v1'';

enum RomanNumerals { I = 1, V = 5, X = 10 }
class DateLexerRegexEngine extends AbstractLexer {
  // 140 lines of boilerplate...
}
```',
    how_it_made_them_feel = 'I just wanted to format a timestamp for a blog post. Now I question my life choices.'
WHERE id = 'conf_seed_1';

UPDATE confessions
SET prompt_used = 'Fix the syntax error on line 42 of this CSS file. Do not change any other lines.',
    what_it_did_instead = 'Rewrote my entire build pipeline in Grunt, converted all CSS to LESS, and deleted half my media queries:

```
module.exports = function(grunt) {
  grunt.initConfig({
    less: { compile: { files: { ''dist/style.css'': ''src/style.less'' } } }
  });
};
```',
    how_it_made_them_feel = 'I stared at the git diff for ten solid minutes with my hands on my head.'
WHERE id = 'conf_seed_2';

UPDATE confessions
SET prompt_used = 'Can you summarize this 2-page PDF into 3 bullet points?',
    what_it_did_instead = 'Apologized 4 times, hallucinated a legal precedent from 1842, and replied:

```
As an AI language model, I do not have direct access to external file systems or PDFs.
```',
    how_it_made_them_feel = 'Defeated. I ended up reading the PDF myself like a medieval peasant.'
WHERE id = 'conf_seed_3';

UPDATE confession_suggestions
SET body = 'Just use native JavaScript without dependencies:

```
new Date(''2026-08-22'').toLocaleDateString(''en-US'', {
  month: ''long'',
  day: ''numeric'',
  year: ''numeric''
});
```

No npm packages or Roman numeral lexers required.'
WHERE id = 'sug_seed_101';
