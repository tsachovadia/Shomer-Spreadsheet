# Archive: Python/Flask MVP (June 16, 2025)

This directory contains a snapshot of the project during an attempt to build a full-stack application using a Python/Flask backend and a Vue.js frontend.

## Key Decisions & Outcome

-   **Architecture:** The goal was to build a traditional web application with a separate backend API and a frontend client.
-   **Backend:** A Flask server was created with a full CRUD API for managing investors, groups, and investments, intended to interact directly with Google Sheets. This includes a testing suite using Pytest.
-   **Frontend:** A Vue.js project was scaffolded to consume the backend API.
-   **Pivot Decision:** After significant development and debugging, the project direction was changed on June 16, 2025. The decision was made to abandon this approach in favor of a simpler, more integrated solution using Google Apps Script as the backend and a Low-Code platform (like Softr) for the frontend.

This code is preserved for historical context and to document the architectural decisions made. 