# Frontend Progress Tracker

| Ticket ID | Title | Status | Evidence |
|-----------|-------|--------|----------|
| FOUND-01-FE | Frontend Repo Bootstrap | DONE | Git repo initialized, env template added, package metadata created, Next.js app shell running locally |
| FOUND-02-FE | CI Pipeline | DONE | CI and deploy workflows added; lint, test, typecheck, and build verified locally |
| AUTH-03-FE | Next.js Web Skeleton | DONE | Auth provider, protected shell pages, public auth shell routes, lint, typecheck, and build verified |
| AUTH-04-FE | Login Page + Token Flow | DONE | OTP send/verify UI wired to backend auth endpoints, resend timer added, login session stored in provider, and FE lint/test/typecheck/build passed |
| DOMAIN-04-FE | Admin Web UI | DONE | Admin layout, dashboard, branches/courses/batches pages, batch detail/roster views, and query hooks implemented and verified |
| PARENT-01-FE | Children Management UI | DONE | Parent shell, children list/add/detail pages, and child data hooks implemented and verified |
| PARENT-02-FE | Enrollment Request UI | DONE | Parent enrollments list, new enrollment multi-step flow, and parent enrollment data hooks implemented and verified |
| PARENT-03-FE | Admin Enrollment Approval UI | DONE | Admin enrollments queue page, pending-first filter, action buttons, and admin enrollment hooks implemented and verified |
| PARENT-04-FE | Parent Dashboard | DONE | Parent dashboard cards, `/parent/dashboard`, and dashboard data hook implemented and verified |
| INST-01-FE | Instructor Batches + Roster UI | DONE | Instructor shell, dashboard, batches list, and batch roster pages implemented and verified |
| INST-02-FE | Attendance Mark + View UI | DONE | Instructor attendance marking page added; parent monthly attendance calendar page added; role navigation updated |
| INST-03-FE | Progress Assessments UI | DONE | Instructor assessments page added under `/instructor/batches/[id]/assessments`; parent assessments page added under `/parent/assessments` |
| PAY-01-FE | Fee Ledger UI | DONE | Admin fees list and generate pages added; parent fees page added; admin and parent navigation updated |
| PAY-02-FE | Razorpay Payment Initiation UI | DONE | Parent payment page added under `/parent/fees/pay`; parent fee ledger cards now preselect entries into checkout; FE lint/typecheck passed |
| REPORT-01-FE | Video Library UI | DONE | `/parent/videos` and `/admin/videos` added with course/level/tag filtering, admin create/edit/delete flow, and shell navigation updates; FE lint/typecheck passed |
| REPORT-02-FE | Admin Reports UI | DONE | Admin reports page added with revenue bars, attendance table, enrollment status summary, scoped filters, and nav entry |
| REL-01-FE | Deployment Setup | IN_PROGRESS | Production env template updated for deployment DSNs; deploy runbook added; FE lint/test/typecheck/build passed; Vercel project/domain setup remains external |
| REL-02-FE | E2E Tests | IN_PROGRESS | Playwright installed and configured with auth, parent enrollment, admin approval, and attendance specs; `playwright test --list` discovers all 4 tests; browser run blocked by missing host Chromium libraries |
