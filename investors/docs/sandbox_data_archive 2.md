# Sandbox Data Archive

This document contains the seed data that was used in the `refactor_sandbox` to prototype the v3 database structure. It is preserved here for historical and testing purposes.

## Investors

| Investor_ID   | Full_Name                | Email                     | Phone          | Contact_Log_Link | Calculation_Method    |
|---------------|--------------------------|---------------------------|----------------|------------------|-----------------------|
| `inv_morsikh`   | Morsikh                  |                           |                |                  | `Daily_Exact_Morsikh` |
| `inv_habib`     | Habib Abraham            | avih007@gmail.com         |                |                  | `Standard_Quarterly`  |
| `inv_hila`      | Hila Kligman (chakimi)   | hilalipshes28@gmail.com   |                |                  | `Standard_Quarterly`  |
| `inv_mordechai` | Mordechai Ben-Shabat     | moty@macabi.us            | (602) 400-2245 |                  | `Standard_Quarterly`  |
| `inv_harvinder` | Harvinder Singh          | harvinder2226@gmail.com   | 6O2-334-8143   |                  | `Standard_Quarterly`  |
| `inv_david`     | David Ishay              |                           |                |                  | `Standard_Quarterly`  |

## Investment Groups

| Group_ID | Group_Name             | Group_Description                                       |
|----------|------------------------|---------------------------------------------------------|
| `SG1`      | Segula Group 1         | The first investment group under the Segula entity.     |
| `Chayil`   | Chayil Properties Pool | A pool of properties managed under the Chayil entity. |

## Investments

| Investment_ID   | Investor_ID     | Group_ID | Investment_Amount | Investment_Date | Interest_Rate | Compounding_Interest | Calculation_Method      |
|-----------------|-----------------|----------|-------------------|-----------------|---------------|----------------------|-------------------------|
| `hila01`        | `inv_hila`      | `SG1`      | 250000            | 2025-02-05      | 0.11          | TRUE                 | `Standard_Quarterly`    |
| `david01`       | `inv_david`     | `SG1`      | 29000             | 2025-05-06      | 0.1           | TRUE                 | `Standard_Quarterly`    |
| `harvinder01`   | `inv_harvinder` | `SG1`      | 200000            | 2025-03-29      | 0.1           | FALSE                | `Standard_Quarterly`    |
| `mordechai01`   | `inv_mordechai` | `SG1`      | 150000            | 2024-11-13      | 0.11          | FALSE                | `Standard_Quarterly`    |
| `habib01`       | `inv_habib`     | `SG1`      | 200000            | 2024-03-01      | 0.11          | FALSE                | `Standard_Quarterly`    |
| `morsikh01`     | `inv_morsikh`   | `Chayil`   | 250000            | 2022-09-29      | 0.11          | TRUE                 | `Daily_Exact_Morsikh` |
| `morsikh02`     | `inv_morsikh`   | `Chayil`   | 250000            | 2022-10-11      | 0.11          | TRUE                 | `Daily_Exact_Morsikh` |
| ...             | ...             | ...      | ...               | ...             | ...           | ...                  | ...                     |

## Payments Log

| Payment_ID         | Investment_ID | Payment_Date | Payment_Amount |
|--------------------|---------------|--------------|----------------|
| `hila_payment_01`  | `hila01`      | 2025-04-01   | 4201.50        |
| `habib_payment_01` | `habib01`     | 2024-04-01   | 1358.90        |
| `habib_payment_02` | `habib01`     | 2024-07-01   | 4000           |
| `habib_payment_03` | `habib01`     | 2024-10-01   | 4000           |
| `morsikh_payment_01`| `morsikh01`   | 2023-01-03   | 40000          |
| ...                | ...           | ...          | ...            |

</rewritten_file> 