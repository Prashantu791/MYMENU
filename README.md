# MYMENU - UNIFIED SPRING BOOT PROJECT (STS)

Frontend aur Backend dono ek sath **Spring Tools for Eclipse (STS)** me chalte hain. **XAMPP ki koi zaroorat nahi hai.**

---

## 🛠 Tech Stack
- **IDE**: Spring Tools for Eclipse (STS 4 / 5.3.x)
- **Java**: Java 17 LTS
- **Backend**: Spring Boot 3.5.x (Spring Web, Spring Data JPA, Spring Security)
- **Frontend**: HTML5, CSS3, Modern JavaScript (served directly from Spring Boot `static/`)
- **Database**: MySQL 8.0+

---

## 📁 Project Structure

```text
d:\Projects\MYMENU\
│
├── BACKEND/                                  <-- STS ME YEH PROJECT IMPORTED HAI
│   ├── pom.xml                               <-- Java 17 + Spring Boot
│   ├── database.sql                          <-- MySQL setup script
│   └── src/main/
│       ├── java/com/mymenu/
│       │   ├── MyMenuApplication.java        <-- MAIN SPRING BOOT APP
│       │   ├── config/
│       │   │   ├── SecurityConfig.java       <-- Security & CORS setup
│       │   │   └── WebConfig.java            <-- Static resource & "/" routing
│       │   ├── controller/                   <-- REST APIs (/api/auth, /api/messes, /api/orders)
│       │   ├── dto/
│       │   ├── entity/
│       │   └── repository/
│       └── resources/
│           ├── application.properties        <-- MySQL connection config
│           └── static/                       <-- FRONTEND WEBSITE FILES
│               ├── index.html                <-- Homepage & UI
│               ├── style.css                 <-- Styling
│               └── app.js                    <-- Frontend Logic & API calls
│
├── FRONTEND/                                 <-- Standalone frontend source copy
└── README.md
```

---

## 🚀 STS me Kaise Run Karein (Step-by-Step)

### Step 1: Database Setup
1. **MySQL Workbench** open karein.
2. `database.sql` (file `BACKEND/database.sql` me hai) open karein aur **Run** (Execute `Ctrl+Shift+Enter`) karein.
3. Isse `mymenu` database, tables aur demo data ban jayega.

### Step 2: MySQL Password Check
`BACKEND/src/main/resources/application.properties` open karein aur check karein:
```properties
spring.datasource.username=root
spring.datasource.password=Aapka_MySQL_Password
```
*(Default `sj1362006` set hai. Agar aapka password alag hai to update karein).*

### Step 3: STS Project Refresh / Update
1. STS open karein.
2. Package Explorer me `mymenu-backend` project par **Right Click** karein.
3. **Maven** -> **Update Project...** (ya shortcut `Alt + F5`) select karein aur **OK** click karein.

### Step 4: Run the Project
**Option A (In STS):**
1. Project `mymenu-backend` par **Right Click** karein.
2. Select karein: **Run As** -> **Spring Boot App**
   *(Ya `MyMenuApplication.java` par Right Click -> Run As -> Java Application)*.

**Option B (Direct 1-Click):**
- Folder me jaakar **`START_SERVER.bat`** par double click karein!

3. STS / Terminal me Spring Boot start ho jayega:
   ```text
   Tomcat started on port 8080 (http) with context path '/'
   Started MyMenuApplication in ... seconds
   ```

### Step 5: Browser me Open Karein
Browser (Chrome/Edge) me open karein:
👉 **`http://localhost:8080/`**

- **Frontend UI** automatically load ho jayega.
- **Backend APIs** (`/api/messes/today`, etc.) directly call honge.
- **Koi CORS error nahi**, **koi XAMPP Apache ki zaroorat nahi**!

---

## 🔑 Demo Login Accounts & Credentials
Detail me sabhi accounts dekhne ke liye file open karein:
👉 **[`TEST_ACCOUNTS.txt`](TEST_ACCOUNTS.txt)**

- **Mess Owners**: `owner1@mymenu.local` se `owner10@mymenu.local` | Password: `password123`
- **Customer**: `customer@mymenu.local` | Password: `password123`

---

## 🗄️ Database Tables
- **`users`**: Customer aur Mess Owner authentication & role data.
- **`mess_owners`**: Mess Owners jab register karte hain to unka separate table me full business & contact info save hota hai (`SELECT * FROM mess_owners;`).
- **`messes`**: Mess profile details (name, location, phone, active status).
- **`daily_menus`**: Aaj ka thali menu, price aur special tag.
- **`orders`**: Customer parcel orders.
- **`mess_notifications`**: Inactivity alerts aur warnings.
