# מפת דרכים: פורטל משקיעים (גישת Apps Script)

מסמך זה עוקב אחר ההתקדמות בפיתוח פורטל המשקיעים.

---

### שלב 1: ניתוח ותיעוד גיליון המשקיעים - **בביצוע**

-   [x] **איפוס הפרויקט:** המבנה אורגן מחדש, הוחלט להתמקד בגיליון הישן.
-   [ ] **ניתוח מעמיק של גיליון המשקיעים (`1d...vkJk`):**
    -   [x] ניתוח גיליון `Pool Properties`.
    -   [x] ניתוח גיליון `SG1`.
    -   [x] ניתוח גיליון `Chayil`.
    -   [x] ניתוח גיליון לדוגמה של משקיע סטנדרטי (למשל, `hila kligman`).
    -   [x] ניתוח גיליון המשקיע המיוחד (`morsikh`) והבנת ההבדלים בלוגיקה.
-   [ ] **עדכון ה-Blueprint:** סיכום כל הממצאים בקובץ `investors/docs/blueprint.md`.

---

### שלב 2: איפיון ותכנון (PRD) - **בהמתנה**
-   [ ] יצירת מסמך דרישות מפורט (PRD) עבור פורטל המשקיעים, על בסיס ה-Blueprint המעודכן.

---

### שלב 3: פיתוח ה-API ב-Google Apps Script - **בביצוע**

-   [x] יצירת קובץ `Code.gs` בתוך ה-Spreadsheet של המשקיעים.
-   [x] יצירת תיעוד `README.md` עבור ה-API.
-   [x] **פיתוח Endpoints:**
    -   [x] `doGet(e)`: פונקציית הניתוב הראשית.
    -   [x] `getUserData(email)`: פונקציה שמחזירה את כל נתוני המשקיע (סיכום, תשלומים וכו').
    -   [x] `getGroupData(groupId)`: פונקציה שמחזירה את נתוני הקבוצה.
-   [x] **Deployment:**
    -   [x] פרסום הסקריפט כ-Web App.
    -   [x] טיפול בהרשאות ו-CORS.

---

### שלב 2: בניית MVP ו-Deployment - **הושלם**
-   [x] פיתוח API ב-Google Apps Script.
-   [x] בניית Frontend ב-React.
-   [x] פריסה (Deployment) ראשונית ל-Firebase Hosting.
-   [x] דיבאגינג ותיקון סביבות dev/build.
-   [x] פריסה סופית ותקינה.

---

### שלב 3: הגדרת תהליכי עבודה (Workflow & Pipeline) - **בהמתנה**
-   [ ] הגדרת Git Flow (ענפי `develop`, `feature`).
-   [ ] הגדרת סביבת Staging ב-Firebase.
-   [ ] תיעוד מלא של תהליך ה-CI/CD.

---

## שלב 0: תכנון מוצר וחווית משתמש (UX) - **הושלם**

-   [x] **יצירת מסמך תכנון UX Blueprint:** נוצר הקובץ `shared_services/docs/blueprint/webapp_ux_blueprint.md`.
-   [x] **סקירה ודיוק (Review & Refine):** סיימנו לדייק את ה-MVP.
-   [x] **אישור סופי של ה-Blueprint.**

---

## שלב 1: בניית תשתית ה-Backend ואיסוף נתונים - **בביצוע**

-   [x] **הגדרת סביבה (Setup):**
    -   [x] יצירת מבנה תיקיות ל-backend/frontend.
    -   [x] בחירת Frameworks: **Flask (Backend)** + **Vue.js (Frontend)**.
-   [x] **שכבת נתונים (Data Layer):**
    -   [x] יצירת מודול `GoogleSheetClient` ויצירת חיבור ראשוני.
-   [x] **מערכת משתמשים (Auth):**
    -   [x] מימוש Endpoint בסיסי ל-`login`.

-   [x] **פיתוח API Endpoints:**
    -   [x] **`GET /api/investors`**: החזרת רשימת המשקיעים מגיליון `[DB] Investors`.
        -   [x] בדיקת ה-Endpoint עם `curl`.
        -   [x] מימוש `POST`, `PUT`, `DELETE` ובדיקתם.
    -   [x] **`GET /api/groups`**: החזרת רשימת קבוצות ההשקעה מגיליון `[DB] Investment_Groups`.
        -   [x] בדיקת ה-Endpoint עם `curl`.
        -   [x] מימוש `POST`, `PUT`, `DELETE` ובדיקתם.
    -   [x] **`GET /api/investments`**: החזרת רשימת ההשקעות מגיליון `[DB] Investments`.
        -   [x] בדיקת ה-Endpoint עם `curl`.
        -   [x] מימוש `POST`, `PUT`, `DELETE` ובדיקתם.
    -   [x] **`GET /api/assets`**: החזרת רשימת הנכסים מה-BMS.
        -   [x] בדיקת ה-Endpoint עם `curl`.
    -   [x] **`GET /api/payments`**: החזרת רשימת התשלומים מגיליון `[DB] Payments_Log`.
        -   [x] בדיקת ה-Endpoint עם `curl`.

---

## שלב 2: בניית ממשק משתמש (Frontend) - **הושלם**
-   [x] הקמת פרויקט React + Vite.
-   [x] הוספת כל קומפוננטות ה-UI (shadcn).
-   [x] חיבור הקומפוננטות ל-API של Apps Script.
-   [x] הרצת האפליקציה המלאה בהצלחה.
-   [x] תיקון בעיות dev/build ו-CORS.

---

## שלב 2: פיצ'רים מתקדמים - **בהמתנה**

-   [ ] דשבורד ניהולי עם KPIs.
-   [ ] יכולת הוספה ועריכה של משקיעים.
-   [ ] אינטגרציית QuickBooks.

---

## שלב 3: אינטגרציית QuickBooks - **בהמתנה**

-   [ ] פיתוח הממשק והלוגיקה הנדרשת. 