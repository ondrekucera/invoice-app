# 🟣 Okvion — Invoice Management App

![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=flat-square&logo=springboot)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-Dev_Server-646CFF?style=flat-square&logo=vite)
![MySQL](https://img.shields.io/badge/MySQL-XAMPP-4479A1?style=flat-square&logo=mysql)
![MapStruct](https://img.shields.io/badge/MapStruct-1.5-red?style=flat-square)
![Lombok](https://img.shields.io/badge/Lombok-1.18-pink?style=flat-square)

> Fullstack fakturační aplikace pro správu faktur a obchodních kontaktů.
> REST API (Spring Boot) · React SPA · Dark / Light mode · Stránkování · Filtrace · Vlastní design systém

---

## 📋 O projektu

**Okvion** je fullstack webová aplikace pro evidenci faktur a obchodních kontaktů. Pokrývá celý fakturační proces — od vytvoření osoby / firmy přes vystavení faktury až po přehledné statistiky a správu smluvních stran.

Vznikla jako portfoliový projekt v rámci kurzu **JAVA PRO developer** na [ITnetwork.cz](https://www.itnetwork.cz). Frontend a UI byly výrazně rozšířeny nad rámec zadání kurzu — vlastní design systém, dark mode, reusable komponenty, UX konzistence.

---

## 🖼️ Přehled obrazovek

| Obrazovka | Popis |
|---|---|
| 📊 **Dashboard** | Přehled KPI statistik, rychlé akce, seznam posledních faktur |
| 👤 **Seznam osob** | Stránkovaný seznam s vyhledáváním podle jména, IČO a města |
| 🧾 **Seznam faktur** | Přepínání Všechny / Vystavené / Přijaté, filtrace, stránkování |
| 🔍 **Detail faktury** | Kompletní přehled faktury, výpočet DPH, badge prošlé splatnosti |
| ✏️ **Formulář faktury** | Vytvoření a úprava faktury, výběr dodavatele a odběratele |
| 📈 **Statistiky** | KPI karty s ručním refresh, odkaz zpět na seznam |
| 🗑️ **Mazání** | Vlastní potvrzovací modal pro faktury i osoby — bez browser dialogů |
| 🌙 **Dark / Light mode** | Přepínatelné téma persistované v localStorage |

> 📸 *Screenshoty doplňte po nasazení nebo spuštění aplikace*

---

## 🚀 Funkce aplikace

### 👤 Osoby (CRUD)
- ✅ Vytvoření nové osoby / firmy (jméno, IČO, DIČ, adresa, kontakt, bankovní údaje)
- ✅ Úprava existující osoby
- ✅ Smazání osoby s potvrzovacím modalem (nevratná akce)
- ✅ Detail osoby s kompletními údaji a odkazem na vystavené / přijaté faktury
- ✅ Stránkovaný seznam osob — 10 / 25 / 50 na stránku
- ✅ Filtrace podle jména, IČO nebo města (lokální, bez reload)

### 🧾 Faktury (CRUD)
- ✅ Vytvoření nové faktury s přiřazením dodavatele a odběratele
- ✅ Úprava existující faktury
- ✅ Smazání faktury s potvrzovacím modalem (nevratná akce)
- ✅ Detail faktury — automatický výpočet ceny včetně DPH
- ✅ **Badge „Po splatnosti"** — vizuální upozornění v detailu faktury
- ✅ **Datum vystavení** zobrazeno přímo v řádku seznamu faktur
- ✅ Filtrace faktur podle produktu, minimální a maximální ceny
- ✅ Přepínání pohledů: **Všechny / Vystavené / Přijaté** s výběrem osoby
- ✅ Stránkovaný seznam faktur — 10 / 25 / 50 na stránku

### 📊 Statistiky
- ✅ Celkový počet faktur, součet a průměrná hodnota všech faktur
- ✅ Data načítána živě z backendu
- ✅ **Ruční refresh** bez přenačtení stránky
- ✅ Statistiky dostupné i na dashboardu

### 🎨 UI / UX
- ✅ **Dark mode** jako výchozí téma, přepínatelný Light mode (persistuje v `localStorage`)
- ✅ Fixní sidebar navigace — sbalitelný na desktopu, drawer (overlay) na mobilech
- ✅ Responzivní design: desktop, tablet, mobil
- ✅ Loading stavy, error handling, prázdné stavy s výzvou k akci
- ✅ Konzistentní `page-eyebrow` breadcrumb labely napříč celou aplikací
- ✅ Sjednocené labely tlačítek: „Zpět na faktury", „Upravit fakturu", „Smazat fakturu"

### 🗑️ Delete flow (V5.5 / V5.6)
- ✅ **Vlastní `ConfirmModal`** — nahrazuje `window.confirm` v celé aplikaci
- ✅ Modal zobrazuje název / číslo mazaného záznamu a varování o nevratnosti akce
- ✅ Zavíratelný klávesou Escape, klikem na overlay nebo tlačítkem Zrušit
- ✅ Fokus na tlačítko Zrušit při otevření (bezpečnější default)
- ✅ Napojený na: seznam faktur, detail faktury, seznam osob, detail osoby

---

## ✨ Novinky ve V5

Verze V5 se zaměřila na dotažení UX, konzistenci a doplnění chybějících flow:

| Novinka | Popis |
|---|---|
| 🔴 **Overdue badge** | V detailu faktury se zobrazí červený badge „Po splatnosti", pokud uplynulo datum splatnosti |
| 📅 **Datum v seznamu** | Datum vystavení je viditelné přímo v řádku seznamu faktur bez nutnosti otevírat detail |
| 🔄 **Refresh statistik** | Tlačítko pro ruční obnovení dat bez reload celé stránky |
| ⬅️ **Kontextová navigace** | Tlačítka „Zpět na faktury" / „Zpět na osoby" místo generického „Zpět" |
| 🏷️ **Sjednocení UI** | Konzistentní labely, eyebrow breadcrumby, button texty napříč celou aplikací |
| 💾 **Kontextový submit** | Formulář faktury rozlišuje „Vytvořit fakturu" a „Uložit změny" dle kontextu |

---

## ✨ Novinky ve V5.5 a V5.6

### V5.5 — ConfirmModal pro faktury
- Nová znovupoužitelná komponenta `ConfirmModal` (animace, overlay, Escape, fokus)
- Napojená na mazání faktury v seznamu faktur (`InvoiceTable`)
- Napojená na mazání faktury v detailu faktury (`InvoiceDetail`)
- Odstraněn `window.confirm` z invoice flow

### V5.6 — ConfirmModal pro osoby
- Stejný `ConfirmModal` napojený na mazání osoby v seznamu osob (`PersonTable`)
- Stejný `ConfirmModal` napojený na mazání osoby v detailu osoby (`PersonDetail`)
- `window.confirm` odstraněn z celého projektu — **0 výskytů**
- Sjednocené `title` atributy: „Detail osoby", „Upravit osobu", „Smazat osobu"
- Button labely v detailu osoby: „Zpět na osoby", „Upravit osobu"

---

## 🛠️ Použité technologie

### Backend
| Technologie | Verze | Účel |
|---|---|---|
| Java | 17 | Programovací jazyk |
| Spring Boot | 3.x | Aplikační framework |
| Spring Data JPA / Hibernate | — | ORM, správa databáze, DDL auto |
| JPA Specification | — | Dynamické filtrování faktur |
| MapStruct | 1.5 | Mapování Entity ↔ DTO |
| Lombok | 1.18 | Redukce boilerplate kódu |
| Bean Validation | — | Validace vstupních dat |
| Springdoc OpenAPI | 2.x | Swagger UI (`/swagger-ui.html`) |
| Maven | — | Build a správa závislostí |

### Frontend
| Technologie | Verze | Účel |
|---|---|---|
| React | 18 | UI framework, SPA |
| React Router | v6 | Klientské routování |
| Lucide React | — | Ikony |
| CSS — vlastní design systém | — | CSS proměnné, dark/light mode, layout, animace |
| Vite | — | Build tool a dev server |

### Databáze a nástroje
| Technologie | Účel |
|---|---|
| MySQL (XAMPP) | Relační databáze, tabulky generovány automaticky |
| Git / GitHub | Verzování, iterativní vývoj |

---

## ⚙️ Spuštění projektu

### Požadavky
- Java 17+
- Node.js 18+
- XAMPP (MySQL)
- IntelliJ IDEA (backend) / VS Code (frontend)

---

### 1. Databáze

1. Spusť **XAMPP Control Panel** → nastartuj **MySQL**
2. Otevři phpMyAdmin: `http://localhost/phpmyadmin`
3. Vytvoř databázi `invoice_app`
4. Tabulky se vygenerují automaticky při prvním spuštění backendu (Hibernate `ddl-auto: update`)

---

### 2. Backend

```bash
cd invoice-app/backend
```

Zkontroluj přihlašovací údaje v `src/main/resources/application.yaml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/invoice_app?createDatabaseIfNotExist=true
    username: root
    password:        # výchozí XAMPP heslo je prázdné
```

Spusť backend:

```bash
./mvnw spring-boot:run
```

> Backend běží na **`http://localhost:8080`**
> Swagger UI: **`http://localhost:8080/swagger-ui.html`**

---

### 3. Frontend

```bash
cd invoice-app/frontend
npm install
npm run dev
```

> Frontend běží na **`http://localhost:3000`**

> ⚠️ Backend musí být spuštěný dříve než frontend — jinak API volání selžou.

---

## 📁 Struktura projektu

```
invoice-app/
│
├── backend/
│   └── src/main/java/cz/itnetwork/
│       ├── controller/            # REST controllery (InvoiceController, PersonController)
│       │   └── advice/            # GlobalExceptionHandler (EntityNotFoundException → 404)
│       ├── service/               # Business logika — rozhraní + implementace
│       ├── entity/                # JPA entity (InvoiceEntity, PersonEntity)
│       │   └── repository/        # Spring Data repozitáře + JPA Specification (filtrace)
│       ├── dto/                   # Data Transfer Objects (InvoiceDTO, PersonDTO, StatisticsDTO)
│       │   └── mapper/            # MapStruct mappery (Entity ↔ DTO)
│       ├── configuration/         # WebMvcConfigurer (CORS)
│       └── constant/              # Výčtové typy (Countries)
│
└── frontend/
    └── src/
        ├── pages/                 # Dashboard (HomePage)
        ├── invoices/              # InvoiceIndex, InvoiceDetail, InvoiceForm,
        │                          # InvoiceTable, InvoiceStatistics
        ├── persons/               # PersonIndex, PersonDetail, PersonForm,
        │                          # PersonTable, Country, Role
        ├── components/            # ConfirmModal, Pagination, usePagination hook,
        │                          # InputField, InputSelect, InputCheck, FlashMessage
        ├── utils/                 # api.js (apiGet/apiPost/apiPut/apiDelete),
        │                          # dateStringFormatter.js
        └── index.css              # Design systém: CSS proměnné, dark/light mode,
                                   # layout, animace, sidebar, cards, modals
```

---

## 📌 Historie verzí

| Verze | Co přibylo |
|---|---|
| **V1** | Základ projektu — Spring Boot + MySQL + základní CRUD pro osoby |
| **V2** | CRUD pro faktury, endpointy pro vystavené a přijaté faktury |
| **V3** | Edit a delete pro osoby, statistiky na backendu (`StatisticsDTO`) |
| **V4** | Dashboard UI, sidebar navigace, dark mode, branding Okvion |
| **V4.1** | Dynamická filtrace přes JPA Specification, filter bar na frontendu |
| **V4.2** | Sidebar collapse na desktopu, mobilní drawer s overlay |
| **V4.3** | Oprava ztráty focusu ve formulářích (Field komponenta mimo render) |
| **V4.4** | UX pro Vystavené/Přijaté faktury s výběrem osoby, finální branding |
| **V4.5** | Frontend stránkování — 10 / 25 / 50 položek, vlastní `usePagination` hook |
| **V4.5.1** | Fix edge case: automatická korekce stránky po smazání posledního záznamu |
| **V5** | Overdue badge, datum v seznamu, refresh statistik, kontextová navigace, sjednocení UI |
| **V5.5** | `ConfirmModal` — vlastní animovaný dialog nahrazuje `window.confirm` pro faktury |
| **V5.6** | `ConfirmModal` rozšířen na osoby — jednotný delete flow v celé aplikaci, `window.confirm` = 0 |

---

## 🏆 Project Highlights

Tato sekce shrnuje klíčové technické a designové rozhodnutí relevantní pro CV a portfolio:

### Architektura a oddělení zodpovědností
- Striktní vrstvená architektura: **Controller → Service (interface + impl) → Repository**
- DTO pattern s **MapStruct** mapováním — entity nikdy neprocházejí přes API vrstvu přímo
- **JPA Specification** pro dynamické sestavování filtrů bez N+1 problémů
- Frontend a backend jsou zcela oddělené aplikace komunikující přes REST API

### Reusable komponenty
- `ConfirmModal` — generický modal s podporou `title`, `message`, `danger` flag, callbacků, Escape klávesy a správy focusu
- `usePagination` — vlastní React hook pro stránkování s automatickou korekcí stránky po smazání
- `Pagination` — sdílená navigační komponenta použitá pro faktury i osoby
- `Field` komponenta v `PersonForm` — definována mimo render cyklus (prevence ztráty focusu)

### UX přístup
- Žádný `window.confirm` ani `alert` pro destruktivní akce — vše řeší vlastní modal
- Kontextové texty tlačítek (ne generické „Zpět", ale „Zpět na faktury")
- Badge upozornění na prošlou splatnost přímo v detailu faktury
- Tab counter zobrazuje počet po filtraci, ne surový počet ze serveru
- Refresh statistik bez reload — `apiGet` volaný znovu na klik

### Design systém
- Kompletní CSS design systém postavený na CSS Custom Properties (proměnných)
- Dark mode jako výchozí téma, Light mode persistovaný v `localStorage`
- Animace modalu přes `@keyframes` — žádná externí knihovna (Framer Motion apod.)
- Responzivní layout pro desktop, tablet i mobil

---

## 📬 Autor

**Ondřej Kučera**

> Portfoliový projekt | Kurz JAVA PRO developer — [ITnetwork.cz](https://www.itnetwork.cz)

---

<div align="center">
  <sub>🟣 Okvion v5.6 &nbsp;·&nbsp; Java 17 + Spring Boot 3 + React 18 + Vite + MySQL</sub>
</div>


---


---

<div align="center">
  <sub>🟣 Okvion v5.6 &nbsp;·&nbsp; Java 17 + Spring Boot 3 + React 18 + Vite + MySQL</sub>
</div>
