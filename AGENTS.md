<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Local development

The Cloud Agent environment starts a local Supabase stack and `npm run dev` on port 3000.

- App: http://127.0.0.1:3000 and http://localhost:3000
- Commands: `npm run dev`, `npm run lint`, `npm run build`
- Local Supabase URL and anon key are written to `.env.local` on boot. Do not commit that file.
- Email confirmation is off on the local stack, so 新規登録 on the login page creates a usable account.
- `npm run lint` currently reports existing `react-hooks/set-state-in-effect` errors in `app/home/page.js` and `components/DayBar.js`.
