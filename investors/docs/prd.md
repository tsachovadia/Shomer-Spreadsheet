# Product Requirements Document (PRD): Shomer Investor Portal MVP

## 1. Overview & Goal

This document outlines the requirements for the Minimum Viable Product (MVP) of the Shomer Investor Portal. The goal is to provide a fast, secure, and visually polished "read-only" portal for investors to view their financial standing, enhancing transparency and trust.

**The New Architecture:**
-   **Backend:** A Google Apps Script deployed as a web app, acting as a secure API server.
-   **Frontend:** A web application built on a Low-Code platform (e.g., Softr) for rapid development.
-   **Data Source:** The original, legacy Investors Google Sheet (`1d...vkJk`).

## 2. Branding & Visual Style

The portal's design will be professional, clean, and modern, reflecting the provided HTML style guide.
-   **Logo:** The "Segula" logo will be prominently displayed.
-   **Color Palette:**
    -   Background: Light neutral (`#f4f7f9`)
    -   Cards/Containers: White (`#ffffff`) with soft shadows.
    -   Primary Accent (for links, buttons, charts): Indigo (`#4338ca`)
    -   Secondary Accent (for charts): Violet (`#7c3aed`)
-   **Typography:** The `Inter` font will be used for all text, ensuring readability and a modern feel.
-   **UI Components:** Data will be presented in "cards" with rounded corners. Interactive elements will have hover effects.

## 3. Core Features & User Stories

### 3.1. User Login
-   **User Story:** As an investor ("Yael"), I want a simple and secure way to log into my personal dashboard so I can access my financial information with confidence.
-   **Requirements:**
    -   A clean login page with the Segula logo.
    -   Authentication mechanism (e.g., email and password, or magic link) managed by the Low-Code platform.

### 3.2. Investor Dashboard (Main Page after Login)
-   **User Story:** As an investor, when I log in, I want to see a high-level summary of my investment status immediately, presented clearly and beautifully.
-   **Requirements:**
    -   **Welcome Header:** "Welcome, [Investor's Full Name]".
    -   **KPI Cards (styled like the HTML example):**
        1.  **Total Amount Invested:** The sum of all initial investments.
        2.  **Current Balance:** The most up-to-date balance, including any interest.
        3.  **Next Quarterly Payment:** The estimated amount of the next payment.
        4.  **Next Payment Date:** The date of the next quarterly payment.
    -   **Quick Link:** A clearly visible link to "View My Investment Group Details".

### 3.3. Investment Group Page
-   **User Story:** As an investor, I want to be able to click a link to see details about the specific investment group I'm part of, so I understand the context of my investment.
-   **Requirements:**
    -   **Group Name:** Display the name of the investment group (e.g., "SG1").
    -   **Partnership Agreement:** A clickable link to the partnership agreement document (URL from the group sheet).
    -   **Investor Mix Chart:** A pie or doughnut chart showing my investment percentage relative to the other (anonymized) investors in the pool.
    -   **Associated Assets Table:** A clean table listing all the properties that collateralize this group.
        -   **Columns:** Property Address, Current UPB.

## 4. Google Apps Script API - Functional Requirements

The `doGet(e)` function in Apps Script will be the single entry point, acting as a router. It must support the following actions:

-   `action=getUserDashboard&email=[user_email]`:
    1.  Find the user's personal sheet based on their email.
    2.  From the user's sheet, retrieve:
        -   The `Current Ending Balance` (from cell `K5`).
        -   The `Q Payment` amount (from cell `L5`).
        -   The `investment group` ID (from cell `M5`).
        -   Calculate the `Total Amount Invested` by summing the `Borrowed` column (C).
    3.  Calculate the `Next Payment Date` (e.g., the start of the next quarter).
    4.  Return all five data points in a single JSON object.

-   `action=getGroupDetails&groupId=[group_id]`:
    1.  Find the specified group sheet (e.g., `SG1`).
    2.  From the group sheet, retrieve:
        -   The `partnership_agreement_link`.
        -   The list of investors and their balances to power the chart.
        -   The list of associated properties and their UPBs from the assets table.
    3.  Return all data in a structured JSON object.

## 5. Out of Scope for MVP

-   Admin-facing functionality.
-   Editing any data from the portal.
-   Displaying transaction-level history (the full ledger). This will be added in a future version.
-   Complex historical performance graphs. 