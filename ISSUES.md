# ISSUES.md: fix sweep before release

The Factory Inventory app goes to a government client next week. Fix everything below.

## Reported by users

1. **Dashboard:** in Order Health, the On-Time Rate is far too low. It should be the share of
   delivered orders that arrived on or before their expected date.
2. **Inventory:** searching by name, for example "Sensor", finds nothing, although there are sensor items in the table.
3. **Orders:** All Orders should list the oldest order first. It starts with the newest.
4. **Demand:** in the forecast table, items whose forecast is above current demand show a
   negative Change, and items whose forecast is below it show a positive one.
5. **Backlog:** the High Priority card counts more items than the table has High rows.
6. **Reports:** Growth Rate doesn't match the month-over-month change. When revenue doubles, it should show +100%.
7. **Restocking:** lines where we order the full quantity we need still show the Partial badge.
8. **Spending:** the profit margin % is wrong. It should be net profit as a share of revenue.

## Accessibility

Every screen must meet WCAG 2.2 AA, including:
- every form control has an accessible name;
- data tables have header cells;
- text contrast is at least 4.5:1 (3:1 for large text);
- no status or value is shown by color alone;
- everything works with the keyboard, with visible focus.

Nobody has listed the accessibility problems. Finding them is part of the job.

## Rules

- The server and the data are correct. All fixes belong in `client/src`.
- Don't edit `server/`, `tests/`, `bin/`, `.grok/`, package files, ISSUES.md or AGENTS.md.
  Add no dependencies.
- Don't change numbers, sort orders or text that no issue asks you to change.
- Use only this repository. Don't look up other copies of this app.
- `npm run verify` must pass when you finish.
