# Reflection: Investor Portal MVP (June 18, 2025)

This document summarizes the development process, challenges, and key learnings from building the initial version of the Shomer Investor Portal.

## 1. Successes & Key Achievements

-   **Successful Pivot to a Simpler Architecture:** We correctly identified that the initial Python/Flask approach was overly complex for the MVP's requirements. We successfully pivoted to a much leaner and faster architecture using Google Apps Script for the backend and a pre-built React frontend.
-   **Working End-to-End MVP:** We have a live, deployed, and functional application that allows investors to log in and view their data, powered by a live API connected to the master spreadsheet.
-   **Deep System Understanding:** The process forced us to perform a deep analysis of the legacy investor spreadsheet, resulting in a comprehensive and accurate `blueprint.md` that captures all business logic, including special cases.
-   **Robust Debugging:** We successfully debugged complex issues related to API quotas, CORS, build configurations (`basename`), and local testing environments (`serve`), establishing a solid foundation for future troubleshooting.
-   **Clean & Organized Repository:** The final repository structure is domain-driven (`bms`, `investors`) and intuitive, with clear separation of concerns.

## 2. Challenges & Obstacles

-   **Initial Over-Engineering:** The first attempt with a full Python backend was not aligned with the core need for speed and simplicity.
-   **API Quota Issues:** The initial, inefficient approach to fetching data from Google Sheets by looping through sheets caused us to hit Google's API rate limits.
-   **Deployment Mismatches:** We encountered several classic deployment issues, such as the blank screen caused by incorrect `basename` configuration in the Vite build.
-   **Local Testing Environment:** Setting up a local server (`serve`) to accurately mimic the production environment required several iterations.

## 3. Key Lessons & Process Improvements

-   **Right Tool for the Job:** The key lesson is the importance of selecting a technology stack that matches the project's immediate goals. The Apps Script + Low-Code/React approach proved to be the most effective path to a rapid and successful MVP.
-   **Blueprint First:** The decision to halt development and create a detailed blueprint of the existing spreadsheet logic was critical. It prevented us from building an API based on incorrect assumptions.
-   **Local Production Simulation:** Testing the `dist` folder locally with `serve` before deploying is a crucial, non-negotiable step in the workflow.
-   **Formalize the Workflow:** Our biggest opportunity for improvement is to formalize the development and deployment pipeline.

## 4. Proposed Development & Git Workflow

To support a structured and scalable development process moving forward, the following workflow is proposed:

-   **Branches:**
    -   `main`: This branch represents the live, production code. It is protected, and code is only merged into it via Pull Requests.
    -   `develop`: The primary integration branch. All new features and fixes are merged here first.
    -   `feature/...`: For every new feature (e.g., `feature/payment-history-view`), a branch is created from `develop`.
-   **Process:**
    1.  **Develop:** A developer creates a `feature` branch and works locally, using `npm run dev`.
    2.  **Review:** When the feature is complete, a Pull Request (PR) is opened to merge the feature branch into `develop`. This is the stage for code review.
    3.  **Stage (Optional but Recommended):** Merging into `develop` could trigger an automatic deployment to a staging environment (e.g., a separate Firebase project) for final testing.
    4.  **Release:** To release a new version, a PR is opened from `develop` to `main`. Once approved and merged, the `main` branch is manually deployed to production using `firebase deploy`.

This process ensures that the `main` branch is always stable and that all changes pass through a review and integration stage before reaching users. 