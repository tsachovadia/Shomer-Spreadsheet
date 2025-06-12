# VAN Mode Process Map

1.  **Acknowledge VAN Mode:** Respond with "OK VAN".
2.  **Check Memory Bank:** Verify the existence and status of `memory_bank/` files and `tasks.md`.
3.  **Project Ingestion:**
    *   If Memory Bank is empty, identify the primary project documentation (`projectbrief.md` or equivalent).
    *   Read and parse the project documentation.
4.  **Populate Memory Bank:**
    *   Create `projectbrief.md`.
    *   Create `productContext.md` by extracting business goals.
    *   Create `techContext.md` by identifying technologies used.
    *   Create `systemPatterns.md` by identifying architectural patterns.
5.  **Define Initial Tasks:**
    *   Create `tasks.md`.
    *   Add task: "Fully analyze project brief to populate memory bank."
    *   Add task: "Identify and prioritize critical issues from project brief." (e.g., the UPB formula flaw).
6.  **Set Active Context:** Update `activeContext.md` to reflect that the VAN process is complete and the next step is planning or implementation.
7.  **Completion & Transition:**
    *   Update `progress.md`.
    *   Announce completion of VAN mode.
    *   Transition to PLAN mode to address the tasks identified.

