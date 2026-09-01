# Antigravity AI Constitution & Development Rules

Enforce these rules across all coding tasks:

1. **Never invent API endpoints**: Implement strictly specified REST contracts (`/api/cases`, `/api/cases/{case_id}/graph`, `/api/cases/{case_id}/investigate`, etc.).
2. **Never invent schemas**: All entity and relation types must strictly align with `canonical_schema.json`.
3. **Never change architecture without explicit instruction and documentation**.
4. **Never silently remove working functionality**.
5. **Never introduce a dependency without justification**.
6. **Never place mock data inside production feature components**: Keep mocks inside `/data` or `/mocks`.
7. **Every feature must implement loading, error, and empty states**.
8. **Never hardcode design values outside the design-token system**.
9. **Never call the LLM directly from the frontend**: All AI interactions must pass through FastAPI backend reasoning services.
10. **Never allow LLM output to bypass structured validation**.
11. **Preserve provenance for every analytical answer**: Every relationship edge must link to source document IDs, timestamps, and extraction method.
12. **Keep components reasonably small and composable**.
13. **Run tests after architectural changes**.
14. **Do not describe entities as guilty**: Use analytical terminology such as connectivity, association, evidence, and confidence score.
15. **Integration priority**: Integration between modules takes priority over isolated module perfection.
