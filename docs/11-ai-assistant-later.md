# 11. AI chat assistant (client request, not in the current build)

The client asked for "an AI chat feature that pulls from the GTM strategy". Read this so the build leaves room for it. Do not build it until asked.

## Important: do not feed the GTM document to a public chatbot as-is

`reference/client-brief/GTM Strategy.md` is an internal planning document. It includes what needs work, homework items, proposed revenue and margin targets, a competitor list and ideal-customer targeting. A public assistant grounded on it could repeat any of that to any visitor, including competitors.

## Proposed approach

1. **A public knowledge base**, written from the GTM strategy plus the site's own content and approved by the client: who Reel Good News helps, the method, each offer (prices for courses, workshop, bundle and book only; never content-package prices), FAQs, how to book a call. Store it in Sanity (a `knowledgeEntry` document with title, body, `approved` flag) so she can edit and approve every answer source.
2. **An "Ask Reel Good News" chat widget** in the brand style, opened from a small floating button in the bottom-right corner (it must not cover the cookie notice or the mobile menu). Server route `/api/assistant` streams answers from a large language model with the approved entries as context (simple retrieval: embed entries, pick the top few).
3. **Guardrails** in the system prompt and code: answer only from approved entries; say so when it does not know; never quote content-package prices; never promise results; follow the voice rules in 08; offer the growth call or the assessment when a visitor shows buying intent; rate-limit by IP; log conversations (no secrets) for the client to review.
4. **Lead capture**: when a visitor asks to talk to someone, collect name, email and phone in the chat and send them through `submitForm('growth', ...)`, so the same GoHighLevel alert fires.

## Alternative

GoHighLevel's own AI chat (a paid add-on in her account) can be trained on approved documents and lives inside the CRM. It is quicker to switch on and keeps conversations in GoHighLevel, but it offers less control over the look, the guardrails and which content it draws from.
