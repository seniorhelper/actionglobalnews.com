# actionglobalnews.com · MASTER-GAMEPLAN
Last updated 2026-11-08 (overnight marketing session). Editorial rules: `CONTENT-GUIDE.md` in this repo. Network plan: `Desktop\01 SEARCH CONVERTS LLC\Search Converts Website Network\05 TIER 3 - Authority - PR, News & Directories\`.

## Role
Ad-supported news and analysis site (AdSense ca-pub-3561679124556057, ads.txt present). Daily briefs on business, technology, Colorado, small business, world. Authority asset for the network; links to eyetoad.com are sponsored only.

## State (Nov 8, 2026)
- Repo on `main`, live on GitHub Pages. Posts are authored as JSON in `_content/articles/` and built with `_tools` (`agn.mjs all`, `check`), which also rebuilds section pages, feeds, sitemaps, search index and llms.txt.
- GA4 G-HWK0S9KPBE on every article page. Search Console verified; GA4↔SC link pending.
- Nov 8: three new briefs (FTC v. Toast and Riverside Payments; Google's AI training control signal; FTC personalized-pricing inquiry), each with two or more primary sources, no images.
- Lighthouse mobile (local lab): home 82 perf / 89 a11y / 77 BP / 100 SEO, TBT 760 ms. The Best Practices and TBT numbers come mostly from the ad scripts; the a11y misses are fixable in CSS/markup.

## Next steps
1. Accessibility pass on the home template (89): contrast and link names; then re-run Lighthouse.
2. Keep AdSense policy-clean: no thin briefs, every story sourced, no auto-generated filler.
3. Add one original Colorado business story per week with a local source (the gap found Nov 8: little local coverage).
4. Link GA4 to Search Console.
