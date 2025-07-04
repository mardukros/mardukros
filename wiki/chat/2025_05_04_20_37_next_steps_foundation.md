# Next Steps: Foundation Improvements (2025-05-04 20:37)

## 1. Review and Integrate PLAN.md and TODO.md
- Both files outline the current gaps and the stepwise plan for production readiness.
- Immediate priorities (from PLAN.md and TODO.md):
  - Enhance error handling and reconnection logic in `marduk-frontend/src/App.tsx`.
  - Integrate new ErrorBoundary and useWebSocket hook into the frontend.
  - Continue backend improvements (logging, health endpoint, LRU cache in ai-coordinator.ts).

## 2. What Has Been Completed
- ErrorBoundary and useWebSocket scaffolds created.
- Logger and /health endpoint added to backend.
- ai-coordinator.ts now uses lru-cache for context management.

## 3. Next Steps
### Frontend
1. **Wrap App in ErrorBoundary**
   - Update `marduk-frontend/src/App.tsx` to use the new ErrorBoundary component at the top level.
2. **Refactor WebSocket Usage**
   - Replace any direct WebSocket usage in App/Dashboard with the new useWebSocket hook.
3. **Add User Notifications**
   - Integrate a notification system (e.g., react-hot-toast) for connection/error states.

### Backend
4. **Monitor /health Endpoint**
   - Use `/health` for local and external monitoring.
5. **Continue PLAN.md Items**
   - Next: Task prioritization in `task-manager.ts` and `task_execution.ts`.
   - Continue with memory optimization and persistence improvements.

### General
6. **Update TODO.md**
   - Check off completed items and add new actionable tasks as needed.

## 4. Terminal Commands Used
- Installed dependencies: `pino`, `lru-cache` (npm)
- No destructive commands run.

## 5. Files Created/Modified
- `marduk-frontend/src/ErrorBoundary.tsx` (new)
- `marduk-frontend/src/useWebSocket.ts` (new)
- `logger.js` (new)
- `server.js` (modified)
- `marduk-ts/core/ai/ai-coordinator.ts` (modified)

---

**Next recommended action:**
- Integrate ErrorBoundary and useWebSocket into App.tsx and Dashboard.tsx.
- Start on PLAN.md backend task prioritization improvements.
- Keep updating TODO.md as you progress.

---
