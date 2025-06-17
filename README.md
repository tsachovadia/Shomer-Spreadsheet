# Shomer Spreadsheet Projects

This repository is a monorepo containing all projects, tools, and documentation related to the Shomer company's spreadsheet-based operations. The projects are organized by their business domain.

## Project Structure

```
/
├── bms/
│   ├── config.json
│   ├── docs/
│   │   └── blueprint.md
│   ├── exports/
│   ├── screenshots/
│   └── scripts/
│       ├── app_scripts/
│       └── payment_dialog/
├── investors/
│   ├── config.json
│   ├── docs/
│   │   └── blueprint.md
│   ├── exports/
│   ├── screenshots/
│   └── scripts/
│       └── app_scripts/
├── memory_bank/
│   ├── הקשר_פעיל.md
│   └── tasks.md
└── archive/
```

-   **`/bms`**: Contains all tools and documentation for the **Business Management System**. This is the core system for managing properties and payments.
    -   `/scripts`: Contains Python scripts for automation.
        - `/app_scripts`: For Google Apps Scripts embedded in the sheet.
        - `/payment_dialog`: Project files for the payment entry interface.
    -   `/config.json`: Configuration file with the BMS spreadsheet ID.
    -   `/docs`: Contains the `blueprint.md` for the BMS logic.
    -   `/exports`: Default location for data exports like formulas.
    -   `/screenshots`: For storing relevant screenshots.

-   **`/investors`**: Contains all tools and documentation for the **Investor Management System**. This is where the future Investor Portal will be developed.
    -   `/scripts`: Contains Python scripts for automation.
        - `/app_scripts`: For Google Apps Scripts related to the investor sheet.
    -   `/config.json`: Configuration file with the Investors spreadsheet ID.
    -   `/docs`: Contains the `blueprint.md` for the investor system logic.
    -   `/exports`: Default location for data exports.
    -   `/screenshots`: For storing relevant screenshots.

-   **`/memory_bank`**: The central "brain" of the project, tracking tasks and high-level decisions.
    -   `הקשר_פעיל.md`: The active context and starting point for any work.

-   **`/archive`**: Contains older, inactive projects for historical reference.

## Getting Started

Each project (`bms`, `investors`) is self-contained. To work with a specific project, navigate to its directory. The automation scripts within each `scripts` folder can be run from their respective parent directories (e.g., from within `/bms`, run `python3 scripts/main.py`). 