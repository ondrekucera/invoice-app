# 🟣 Okvion — Invoice Management App

![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=flat-square&logo=springboot)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-Dev_Server-646CFF?style=flat-square&logo=vite)
![MySQL](https://img.shields.io/badge/MySQL-XAMPP-4479A1?style=flat-square&logo=mysql)

> Fullstack CRUD aplikace pro správu faktur a obchodních kontaktů.  
> REST API (Spring Boot) · React dashboard · Dark mode · Stránkování · Filtrování

---

## 📋 O projektu

**Okvion** je fullstack webová aplikace pro evidenci faktur a obchodních kontaktů.
Pokrývá celý fakturační proces — vytvoření faktury, správu dodavatelů a odběratelů až po přehledné statistiky.

Vznikla jako portfoliový projekt v rámci kurzu JAVA PRO developer na [ITnetwork.cz](https://www.itnetwork.cz) — frontend a UI byly výrazně rozšířeny nad rámec zadání.

---

## 🖼️ Náhled aplikace

| | |
|---|---|
| 📊 **Dashboard** | *Přehled statistik, rychlé akce, poslední faktury* |
| 🧾 **Seznam faktur** | *Přepínání Všechny / Vystavené / Přijaté, filtrace, stránkování* |
| ✏️ **Formulář faktury** | *Vytvoření a úprava faktury, výběr smluvních stran* |
| 🌙 **Dark / Light mode** | *Přepínání barevného schématu, dark jako výchozí* |

> 📸 *Screenshoty doplňte po nasazení nebo spuštění aplikace*

---

## 🚀 Funkce aplikace

### 👤 Osoby
- ✅ Vytvoření, úprava a smazání osoby nebo firmy
- ✅ Detail s kompletními údaji (IČO, DIČ, bankovní účet, adresa, kontakt)
- ✅ Filtrování podle jména, IČO nebo města

### 🧾 Faktury
- ✅ Vytvoření, úprava a smazání faktury
- ✅ Přiřazení dodavatele a odběratele ze seznamu osob
- ✅ Detail s automatickým výpočtem ceny včetně DPH
- ✅ Filtrace podle produktu, minimální a maximální ceny
- ✅ Přepínání pohledů: **Všechny / Vystavené / Přijaté** s výběrem osoby

### 📊 Statistiky
- ✅ Přehledné KPI v reálném čase: počet faktur, celková a průměrná hodnota
- ✅ Data se načítají přímo z backendu při každém zobrazení

### 🎨 UI / UX
- ✅ Dashboard s přehledem a rychlými akcemi na úvodní stránce
- ✅ **Dark mode** jako výchozí, přepínatelný Light mode (persistuje v localStorage)
- ✅ Fixní sidebar navigace — sbalitelný na desktopu, drawer na mobilech
- ✅ Stránkování — 10 / 25 / 50 položek na stránku s automatickou korekcí
- ✅ Responzivní design: desktop, tablet, mobil
- ✅ Loading stavy, error handling, prázdné stavy s výzvou k akci

---

## 🛠️ Použité technologie

### Backend
| Technologie | Verze | Účel |
|---|---|---|
| Java | 17 | Programovací jazyk |
| Spring Boot | 3.x | Aplikační framework |
| Spring Data JPA / Hibernate | — | ORM a správa databáze |
| MapStruct | — | Mapování Entity ↔ DTO |
| Lombok | — | Redukce boilerplate kódu |
| Bean Validation | — | Validace vstupních dat |
| Maven | — | Build a správa závislostí |

### Frontend
| Technologie | Verze | Účel |
|---|---|---|
| React | 18 | UI framework |
| React Router | v6 | Klientské routování (SPA) |
| Lucide React | — | Ikony |
| CSS (vlastní design systém) | — | CSS proměnné, dark/light mode, responzivita |
| Vite | — | Build tool a dev server |

### Databáze a nástroje
| Technologie | Účel |
|---|---|
| MySQL (XAMPP) | Relační databáze |
| Git / GitHub | Verzování a správa kódu |

---

## ⚙️ Spuštění projektu

### Požadavky
- Java 17+
- Node.js 18+
- XAMPP (MySQL)
- IntelliJ IDEA (backend) / VS Code (frontend)

---

### 1. Databáze

1. Spusť XAMPP → nastartuj **Apache** + **MySQL**
2. Otevři phpMyAdmin: `http://localhost/phpmyadmin`
3. Vytvoř databázi `invoice`
4. Tabulky se vygenerují automaticky při prvním spuštění backendu (Hibernate DDL auto)

---

### 2. Backend

```bash
cd invoice-app/backend
```

Zkontroluj přihlašovací údaje v `src/main/resources/application.yaml`, pak spusť:

```bash
./mvnw spring-boot:run
```

> Backend běží na **`http://localhost:8080`**

---

### 3. Frontend

```bash
cd invoice-app/frontend
npm install
npm run dev
```

> Frontend běží na **`http://localhost:5173`**

> ⚠️ Backend musí být spuštěný dříve než frontend — jinak API volání selžou.

---

## 📁 Struktura projektu

```
invoice-app/
├── backend/
│   └── src/main/java/cz/itnetwork/
│       ├── controller/        # REST controllery
│       ├── service/           # Business logika (rozhraní + implementace)
│       ├── entity/            # JPA entity
│       │   └── repository/    # Spring Data repozitáře + JPA Specification
│       ├── dto/               # Data Transfer Objects
│       │   └── mapper/        # MapStruct mappery
│       └── constant/          # Výčtové typy (Countries)
│
└── frontend/
    └── src/
        ├── pages/             # Stránky (Dashboard)
        ├── persons/           # Správa osob
        ├── invoices/          # Správa faktur
        ├── components/        # Sdílené komponenty (Pagination, usePagination hook)
        ├── utils/             # API komunikace
        └── index.css          # Design systém (CSS proměnné, dark/light mode, layout)
```

---

## 📌 Historie verzí

| Verze | Co přibylo |
|---|---|
| **V1** | Základ projektu, CRUD pro osoby |
| **V2** | CRUD pro faktury, vystavené a přijaté faktury |
| **V3** | Edit a delete pro osoby, statistiky na backendu |
| **V4** | Dashboard UI, sidebar, dark mode, filtrace faktur |
| **V4.1** | Filtrace přes JPA Specification, filter bar na frontendu |
| **V4.2** | Sidebar collapse, mobilní drawer, branding Okvion |
| **V4.3** | Oprava ztráty focusu ve formulářích, filtr osob |
| **V4.4** | UX Vystavené/Přijaté, centrování formulářů, finální branding |
| **V4.5** | Frontend pagination — 10 / 25 / 50 položek na stránku |
| **V4.5.1** | Fix edge case: korekce stránky po smazání záznamu |

---

## 🎯 Cíl projektu

Projekt demonstruje schopnost navrhnout a dokončit kompletní fullstack aplikaci od databázové vrstvy přes REST API až po moderní React frontend.

**Konkrétně ukazuje:**
- Návrh REST API a vrstvené architektury (Controller → Service → Repository)
- Práci s JPA/Hibernate a dynamické filtrování přes JPA Specification
- Mapování dat přes MapStruct (Entity ↔ DTO)
- Stavové řízení v Reactu — useState, useEffect, useMemo, vlastní hooky
- Tvorbu vlastního design systému s podporou dark/light mode
- Verzování projektu a iterativní vývoj přes Git

---

## 📬 Autor

**Ondřej Kučera**

> Portfoliový projekt | Kurz JAVA PRO developer — [ITnetwork.cz](https://www.itnetwork.cz)

---

<div align="center">
  <sub>🟣 Okvion v4.5.1 &nbsp;·&nbsp; Java 17 + Spring Boot + React + Vite</sub>
</div>
