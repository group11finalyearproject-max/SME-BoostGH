# Future Functions Roadmap for SME Boost GH

## Current Project Analysis
SME Boost GH is already a solid final year project with a meaningful set of features for Ghanaian SMEs. The app is more than a simple prototype because it already supports user authentication, onboarding, customer management, invoice creation, tax calculation support, profile editing, dark mode, and AI-powered writing tools.

The current app includes:

- User authentication with Firebase
- Guided onboarding for new users
- A dashboard with business summary cards and recent activity
- Customer management through the CRM screens
- Invoice creation, invoice status tracking, and QR payment demo flow
- Ghana tax calculation support for invoices and tax report viewing
- AI workflows for business plans, marketing content, professional emails, and business advice
- Profile editing and theme preferences
- Offline-first local storage using AsyncStorage

This means the project already demonstrates a strong mix of business utility, AI integration, and mobile usability. The next stage is not to rebuild the app, but to add the most important features that will make it feel more complete, practical, and impressive for submission.

## What Is Already Strong
Several parts of the project are already strong and should be presented confidently:

- The app solves real SME problems instead of only showing generic screens.
- The AI tools are integrated into clear business workflows, not just a basic chatbot.
- The invoice and customer features make the product feel practical and relevant.
- The onboarding flow supports low-technical users with guided steps.
- The dashboard already creates a good foundation for business visibility.
- The tax support gives the project a strong local relevance for Ghanaian businesses.
- The UI structure is organized around reusable components and a clean routing setup.

Because these foundations are already in place, the best future additions are the ones that deepen usefulness and completeness without disrupting the existing architecture.

## Ranked Roadmap of Important Additions

### 1. Real Business Reports Dashboard
This should be the highest priority addition because the reports area is still a placeholder in `app/app/(dashboard)/reports.tsx`. It is the clearest visible gap in the current product.

Why it matters:

- Reports make the app feel more complete and professional.
- Lecturers and reviewers usually expect some form of summarized business insight.
- It gives users better decision-making support instead of only data entry screens.

Current evidence in the codebase:

- `app/app/(dashboard)/reports.tsx` currently says reports are coming soon.
- The dashboard already calculates useful metrics such as revenue, customer count, and pending invoices.
- Invoice and customer records are already available in local storage and can be aggregated.

Suggested MVP scope:

- Revenue trend cards
- Paid, pending, and overdue invoice summary
- Customer growth summary
- Simple charts or visual cards
- Date filters such as weekly, monthly, and all-time

### 2. Invoice Reminders and Notifications
This should be the second priority because the app already tracks pending and overdue invoices, but follow-up is still manual. Notifications are conceptually supported in configuration, but not yet active in the user experience.

Why it matters:

- It improves real business usefulness for SME owners who may forget payment follow-up.
- It supports cash flow management, which is very important for small businesses.
- It makes the invoice module feel more active and intelligent.

Current evidence in the codebase:

- Invoice statuses already include `pending` and `overdue`.
- The dashboard and AI advisor already react to unpaid invoices.
- Notifications are referenced in `app/config/features.ts`, but user-facing notification behavior is not yet complete.
- The profile screen currently shows notifications as not active yet.

Suggested MVP scope:

- Reminder for upcoming due dates
- Reminder for overdue invoices
- In-app notification center or alert list
- Simple reminder status such as sent, pending, or dismissed

### 3. Real Invoice Sharing and Resend Flow
This is a very good submission-focused feature because invoice resend currently exists only as a placeholder. Making it real would improve both demo quality and practical usefulness.

Why it matters:

- It makes the invoicing feature feel closer to a real business tool.
- It improves communication between the business owner and customer.
- It is easier to present during a demo than larger backend-heavy features.

Current evidence in the codebase:

- `app/app/invoices/[id].tsx` includes a resend action, but it currently shows a placeholder message.
- The QR payment modal already supports sharing part of the payment flow.
- Invoice data is already structured enough to support export or message generation.

Suggested MVP scope:

- Share invoice summary through native share
- Export invoice details in a customer-friendly format
- WhatsApp-friendly invoice message
- Email-friendly invoice summary text
- Record whether an invoice has been shared or resent

### 4. Real Payment Integration
This is an important feature, but it should come after reports and communication improvements because it is more sensitive and implementation-heavy.

Why it matters:

- It would make the app more realistic for real-world use.
- It strengthens the connection between invoices and revenue collection.
- It adds strong practical value for SMEs if implemented safely.

Current evidence in the codebase:

- `app/services/payments.ts` is still a stub.
- The QR payment modal currently includes a simulated payment flow.
- Feature configuration already includes payment settings and provider selection.

Suggested MVP scope:

- Initialize a real payment transaction
- Verify completed transactions
- Attach payment reference to invoice
- Update invoice status after successful verification

### 5. Cloud Sync and Backup
This is one of the most important long-term product improvements because the app currently depends mainly on local storage. It is valuable, but not the first feature to prioritize if submission time is limited.

Why it matters:

- Users should not risk losing important business records on one device.
- Cloud sync makes the app feel more trustworthy and scalable.
- It supports multi-device continuity in the future.

Current evidence in the codebase:

- The app uses AsyncStorage for customers, invoices, drafts, onboarding, and profile data.
- `app/services/sync.ts` is currently a stub.
- `app/hooks/useOfflineSync.ts` already suggests a future sync structure.

Suggested MVP scope:

- Upload local records to cloud storage
- Pull latest cloud records back to device
- Manual sync action
- Dirty-flag approach for changed records
- Basic backup and restore behavior

### 6. Better Help, Guidance, and Support for Low-Tech Users
This is especially important because the project targets Ghanaian SMEs with low to medium technical knowledge. Strong support flows would improve accessibility and reduce confusion.

Why it matters:

- It aligns directly with the target audience.
- It improves usability without requiring major backend changes.
- It supports a stronger UX story in your final presentation.

Current evidence in the codebase:

- Onboarding is already guided, which is a good foundation.
- The profile screen shows help and support as still being expanded.
- Empty and state cards already exist and can support more guided messaging.

Suggested MVP scope:

- FAQ screen
- Contextual help tips inside forms and workflows
- Short onboarding reminders after first use
- Better empty-state education for customers, invoices, and AI tools

### 7. Analytics and Usage Tracking
This is valuable for product maturity and evaluation, especially in an academic setting, because it shows that the app can be measured and improved with real usage insights.

Why it matters:

- It helps evaluate which features are actually useful.
- It supports future data-driven improvements.
- It strengthens the technical depth of the project.

Current evidence in the codebase:

- `app/services/analytics.ts` is currently a stub.
- Feature configuration already includes analytics settings.
- Many user actions such as onboarding, invoice creation, and AI workflow usage are easy to track.

Suggested MVP scope:

- Track onboarding completion
- Track invoice creation
- Track AI workflow usage
- Track customer creation
- Track key screen visits and successful actions

### 8. AI Quality and Business Intelligence Improvements
The AI features are already useful, but there is room to make them more tailored, more context-aware, and more business-specific over time.

Why it matters:

- AI is one of the most distinctive parts of the project.
- Stronger AI quality can make the app stand out during presentation.
- Better business context can improve trust and usefulness for SMEs.

Current evidence in the codebase:

- AI workflows already exist for business plans, marketing, emails, and advisor chat.
- The AI advisor already uses summary business metrics.
- Backend prompts are still relatively simple and can be improved further.

Suggested MVP scope:

- Better prompt templates for each workflow
- Saved prompt templates or reusable generation presets
- More tailored outputs based on stored customer and invoice activity
- Stronger business recommendations from available app data

## Best Additions Before Submission
If time is limited, the best three additions to focus on before final submission are:

### 1. Reports Dashboard
This is the most visible product gap and the easiest way to make the app feel more complete during demonstration.

### 2. Invoice Reminders and Notifications
This adds clear business value and improves the usefulness of existing invoice features without needing a full product rewrite.

### 3. Real Invoice Sharing and Export
This is practical, demo-friendly, and lower risk than full payment integration or full cloud sync.

These three additions are the best balance of:

- High user value
- Strong presentation value
- Lower implementation risk
- Better use of the current codebase

Compared with real payment integration or full cloud sync, they are more realistic to complete safely before submission and still make the app look significantly stronger.

## Longer-Term Expansion
If submission time becomes tight, real payment integration and cloud sync should be treated as the next phase after submission. They are very important, but they require more testing, more careful error handling, and more trust-related design decisions.

A sensible order would be:

1. Reports dashboard
2. Invoice reminders and notifications
3. Invoice sharing and export
4. Payment integration
5. Cloud sync and backup

This order improves the visible product quality first, then moves into heavier infrastructure work.

## Likely Future Data and Interface Additions
To support the roadmap above, the app will likely need some extra data fields and helper structures in the future.

Expected additions include:

- Invoice reminder metadata such as due reminder status or reminder history
- Invoice send or share history for resend tracking
- Payment references and transaction verification results linked to invoices
- Dirty-state or last-synced metadata for local records during sync
- Aggregate report helpers for invoices and customer analytics
- Notification preferences or help-completion state for user guidance

These should be treated as expected future additions to support feature growth. Exact schema design can be decided during implementation.

## Final Recommendation
SME Boost GH is already a strong and practical final year project. The best strategy now is to focus on the additions that make the app feel complete, trustworthy, and useful in everyday small business work.

The strongest immediate roadmap is:

1. Complete reports
2. Add reminders and notifications
3. Make invoice sharing real

If these are added well, the project will present as a polished SME productivity tool rather than only a promising prototype.
