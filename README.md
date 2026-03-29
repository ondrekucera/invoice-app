# 🟣 Okvion — Fakturační aplikace

![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.1-6DB33F?style=flat-square&logo=springboot)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)
![MySQL](https://img.shields.io/badge/MySQL-XAMPP-4479A1?style=flat-square&logo=mysql)
![MapStruct](https://img.shields.io/badge/MapStruct-1.5-red?style=flat-square)
![Lombok](https://img.shields.io/badge/Lombok-1.18-pink?style=flat-square)

> Fullstack fakturační aplikace — Spring Boot REST API · React SPA · vlastní design systém · dark/light mode

---

## ✨ Klíčové vlastnosti

- **Plný CRUD** pro faktury i osoby / firmy s vrstvenou Spring Boot architekturou
- **Dynamické filtrování** na backendu přes JPA Specification (faktury i osoby)
- **Export do CSV** — faktury i osoby s UTF-8 BOM pro správné otevření v MS Excel
- **Statistiky a revenue přehled** — agregační JPQL dotazy, přehled tržeb osob podle roku
- **Dvouúrovňová validace** — Bean Validation (HTTP 400) + doménová logika `BusinessException` (HTTP 422)
- **Profesionální UX bez knihoven** — vlastní toast systém, optimistic updates, skeleton loading, custom formulářové komponenty
- **Dark / light mode** persistovaný v `localStorage`, sbalitelný sidebar, mobilní drawer
- **Unit testy** na service vrstvě (JUnit 5 + Mockito) i frontend komponentách (Vitest + Testing Library)

---

## O projektu

**Okvion** je fullstack webová aplikace pro evidenci faktur a obchodních kontaktů. Pokrývá celý fakturační proces — od registrace osoby / firmy přes vytváření faktur, sledování splatnosti až po přehledné statistiky a správu smluvních stran.

Vznikla jako portfoliový projekt v rámci kurzu **JAVA PRO developer** na [ITnetwork.cz](https://www.itnetwork.cz). Nad rámec zadání kurzu byl projekt výrazně rozšířen o vlastní design systém, pokročilý error handling, export dat, revenue analytiku a testování.

---

## Hlavní funkce

### 👤 Správa osob
- Plný CRUD — vytvoření, úprava, smazání, detail
- Eviduje jméno / firmu, IČO, DIČ, bankovní spojení, kontakt, adresu a kategorii
- Filtrování na backendu přes JPA Specification (jméno, IČO, město, země, kategorie)
- Stránkování — 10 / 25 / 50 položek na stránku
- Přehled vystavených a přijatých faktur přímo z detailu osoby
- Export evidence osob do CSV (UTF-8 BOM)

### 🧾 Správa faktur
- Plný CRUD — vytvoření, úprava, smazání, detail
- Přiřazení dodavatele a odběratele z evidence osob
- Automatický výpočet ceny s DPH
- Badge „Po splatnosti" — vizuální upozornění při prošlém datu splatnosti
- Filtrování na backendu: produkt, minimální a maximální cena (JPA Specification)
- Přepínání pohledů: Všechny / Vystavené / Přijaté s výběrem osoby
- Stránkování — 10 / 25 / 50 položek na stránku
- Export faktur do CSV (UTF-8 BOM)

### 📊 Statistiky a analytika
- Celkový počet faktur, součet a průměrná hodnota
- Přehled tržeb osob podle roku (`/api/persons/statistics/revenue?year=`)
- Data se počítají přímo na backendu pomocí JPQL agregačních dotazů
- Přehled dostupný na dashboardu i jako samostatná stránka

### 🎨 UI / UX
- Dark mode (výchozí) a Light mode — persistováno v `localStorage`
- Sbalitelný sidebar na desktopu, mobilní drawer s overlay
- Skeleton loading místo spinneru při načítání dat
- Vlastní toast notifikace (success / error / loading) v pravém dolním rohu
- Optimistic updates pro mazání — okamžitá reakce UI s rollbackem při chybě
- Vlastní `ConfirmModal` — žádné `window.confirm` ani `alert` v celé aplikaci
- Datum a čas v topbaru s volitelným formátem (24h / 12h)
- Nastavení aplikace: téma, jazyk, formát data a formát času

---

## Architektura

```
invoice-app/
├── backend/                          # Spring Boot aplikace
│   └── src/main/java/cz/itnetwork/
│       ├── controller/               # REST controllery
│       │   └── advice/               # Globální exception handler
│       ├── service/                  # Business logika (rozhraní + implementace)
│       ├── entity/                   # JPA entity
│       │   └── repository/           # Spring Data repozitáře + JPA Specification
│       ├── dto/                      # Data Transfer Objects
│       │   └── mapper/               # MapStruct mappery (Entity ↔ DTO)
│       ├── exception/                # Vlastní výjimky (BusinessException)
│       ├── configuration/            # CORS konfigurace
│       └── constant/                 # Výčtové typy (Countries, PersonCategory)
│
└── frontend/                         # React SPA
    └── src/
        ├── pages/                    # HomePage (dashboard), SettingsPage
        ├── invoices/                 # InvoiceIndex, InvoiceDetail, InvoiceForm,
        │                             #   InvoiceTable, InvoiceStatistics
        ├── persons/                  # PersonIndex, PersonDetail, PersonForm,
        │                             #   PersonTable, Country
        ├── components/               # Sdílené komponenty
        │   ├── ToastContext.jsx       #   Toast systém (Context + Provider)
        │   ├── PersonSelect.jsx       #   Vyhledávací dropdown pro výběr osoby
        │   ├── CountrySelect.jsx      #   Vyhledávací dropdown pro výběr země
        │   ├── DateInput.jsx          #   Custom date picker s kalendářem
        │   ├── CustomSelect.jsx       #   Generický styled dropdown
        │   ├── SkeletonList.jsx       #   Skeleton loading komponenta
        │   ├── ConfirmModal.jsx       #   Potvrzovací modal
        │   ├── Pagination.jsx         #   Stránkování
        │   └── usePagination.js       #   Custom React hook
        ├── utils/
        │   ├── api.js                 #   Fetch wrapper s ErrorResponseDTO zpracováním
        │   ├── appSettings.js         #   Settings manager (localStorage)
        │   ├── dateUtils.js           #   Konverze a validace datumů
        │   └── dateStringFormatter.js #   Formátování pro zobrazení
        └── index.css                  #   Design systém (CSS proměnné, dark/light, animace)
```

### Vrstvená architektura backendu

```
HTTP Request
    ↓
Controller          ← @Valid Bean Validation, @RequestBody
    ↓
Service             ← Business validace (BusinessException)
    ↓
Repository          ← JPA Specification, JPQL dotazy
    ↓
Entity / MySQL
    ↓
DTO + MapStruct     ← Entity → DTO před odesláním do controlleru
    ↓
HTTP Response       ← ErrorResponseDTO při chybě (timestamp, status, message, path, validationErrors)
```

---

## Použité technologie

### Backend

| Technologie | Verze | Použití |
|---|---|---|
| Java | 17 | Programovací jazyk |
| Spring Boot | 3.1 | Aplikační framework, auto-konfigurace |
| Spring Data JPA + Hibernate | — | ORM, DDL auto, lazy loading |
| JPA Specification | — | Dynamické filtrování faktur i osob (AND podmínky) |
| MapStruct | 1.5 | Mapování Entity ↔ DTO bez boilerplate |
| Lombok | 1.18 | Generování getterů, setterů, konstruktorů |
| Bean Validation | — | Validace DTO (`@NotBlank`, `@Email`, `@DecimalMin`) |
| Springdoc OpenAPI | 2.2 | Swagger UI |
| JUnit 5 + Mockito | — | Unit testy service vrstvy |
| Maven | — | Build a správa závislostí |

### Frontend

| Technologie | Verze | Použití |
|---|---|---|
| React | 18 | UI framework, SPA |
| React Router | v6 | Klientské routování, nested routes |
| Lucide React | 0.383 | Ikony |
| Vite | 6 | Build tool, dev server |
| Vitest + Testing Library | — | Unit testy komponent |
| CSS Custom Properties | — | Vlastní design systém, dark/light mode |

### Databáze a nástroje

| Nástroj | Použití |
|---|---|
| MySQL (XAMPP) | Relační databáze — tabulky generovány automaticky |
| Git / GitHub | Verzování, iterativní vývoj |

---

## Spuštění projektu

### Požadavky

- Java 17+
- Node.js 18+
- XAMPP (MySQL)

### 1. Databáze

1. Spusť **XAMPP Control Panel** → nastartuj **MySQL**
2. Databáze `invoice_app` se vytvoří automaticky při prvním spuštění backendu
3. Tabulky generuje Hibernate (`ddl-auto: update`)

### 2. Backend

```bash
cd backend
./mvnw spring-boot:run
```

Zkontroluj `src/main/resources/application.yaml` — výchozí XAMPP konfigurace:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/invoice_app?createDatabaseIfNotExist=true
    username: root
    password:          # výchozí XAMPP heslo je prázdné
```

Backend běží na: **`http://localhost:8080`**
Swagger UI: **`http://localhost:8080/swagger-ui.html`**
API dokumentace: **`http://localhost:8080/api-docs`**

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend běží na: **`http://localhost:3000`**

> Backend musí být spuštěný dříve než frontend.

### Konfigurace prostředí (frontend)

Frontend čte URL backendu z proměnné prostředí. Soubor `.env` je přiložen v repozitáři:

```env
VITE_API_URL=http://localhost:8080
```

Pro jiné prostředí stačí upravit hodnotu v `.env` před spuštěním `npm run dev`.

### Testy

```bash
# Backend
cd backend && ./mvnw test

# Frontend
cd frontend && npm run test
```

---

## REST API

| Metoda | Endpoint | Popis |
|---|---|---|
| `GET` | `/api/persons` | Seznam osob s filtrací (query params) |
| `GET` | `/api/persons/{id}` | Detail osoby |
| `POST` | `/api/persons` | Vytvoření osoby |
| `PUT` | `/api/persons/{id}` | Úprava osoby |
| `DELETE` | `/api/persons/{id}` | Soft-delete osoby (hidden = true) |
| `GET` | `/api/persons/statistics/revenue` | Tržby osob podle roku (`?year=`) |
| `GET` | `/api/invoices` | Seznam faktur s filtrací (query params) |
| `GET` | `/api/invoices/{id}` | Detail faktury |
| `POST` | `/api/invoices` | Vytvoření faktury |
| `PUT` | `/api/invoices/{id}` | Úprava faktury |
| `DELETE` | `/api/invoices/{id}` | Smazání faktury |
| `GET` | `/api/invoices/statistics` | Statistiky faktur |
| `GET` | `/api/invoices/sales/{personId}` | Vystavené faktury osoby |
| `GET` | `/api/invoices/purchases/{personId}` | Přijaté faktury osoby |
| `GET` | `/api/export/persons/csv` | Export osob do CSV |
| `GET` | `/api/export/invoices/csv` | Export faktur do CSV |

Chybové odpovědi používají jednotnou strukturu `ErrorResponseDTO`:

```json
{
  "timestamp": "2026-03-28T14:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Vstupní data obsahují chyby.",
  "path": "/api/invoices",
  "validationErrors": {
    "product": "Produkt nesmí být prázdný.",
    "issued": "Datum vystavení je povinné."
  }
}
```

---

## Validace a error handling

### Bean Validation (HTTP 400)
- `PersonDTO`: `@NotBlank` na jméno a IČO, `@Email` na e-mail, `@Size` na ostatní stringy
- `InvoiceDTO`: `@NotNull` na datum a smluvní strany, `@DecimalMin("0.0")` na cenu a DPH
- Aktivováno přes `@Valid` na POST a PUT endpointech

### Business validace (HTTP 422)
- Kupující a prodávající nesmí být stejná osoba
- Datum splatnosti nesmí být před datem vystavení
- Cena ani DPH nesmí být záporné
- Null-safety kontroly pro buyer/seller ID
- Implementováno v `InvoiceServiceImpl.validateInvoice()` přes `BusinessException`

### Frontend error handling
- `api.js` parsuje `ErrorResponseDTO` z každé chybové odpovědi
- `parseApiError(error)` vrátí `{ message, validationErrors }` pro použití ve formulářích
- Validační chyby se zobrazují inline pod příslušnými poli
- Při chybě formulář scrolluje na první chybné pole, zavolá `focus()` a spustí pulse animaci
- `noValidate` atribut na formulářích — žádná browser-level validace

### Exception handling (backend)
- `EntityNotFoundException` → HTTP 404
- `MethodArgumentNotValidException` → HTTP 400 s mapou pole → zpráva
- `BusinessException` → HTTP 422

---

## UX vylepšení

### Toast notifikace
- Vlastní toast systém bez externí knihovny — React Context + Provider
- Typy: `success` (zelený), `error` (červený), `info` (modrý), `loading` (fialový se spinnerem)
- `loading` toast se nezavírá automaticky — přechází na `success` / `error` po odpovědi backendu
- `updateToast(id, patch)` umožňuje aktualizovat existující toast
- Animace fade-in / fade-out pomocí CSS keyframes
- Pozice: pravý dolní roh, stackování více toastů

### Optimistic updates
- Mazání faktur a osob: položka zmizí z UI okamžitě bez čekání na server
- Při selhání API požadavku se položka vrátí zpět (rollback)
- Chyba je zobrazena přes error toast

### Skeleton loading
- Místo spinneru se zobrazí skeleton řádky imitující skutečný layout
- Shimmer animace pomocí CSS gradient + keyframes
- Přizpůsobeno dark / light modu přes CSS proměnné

### Custom formulářové komponenty
- **`PersonSelect`** — vyhledávací dropdown pro výběr osoby z evidence, debounce 300ms, inline vytvoření nové osoby
- **`CountrySelect`** — vyhledávací dropdown pro výběr země (aktuálně CZ / SK), filtruje podle názvu i klíčových slov
- **`DateInput`** — textový input s custom kalendářem, podporuje CZ (DD.MM.YYYY) i ISO formát, validuje reálná data
- **`CustomSelect`** — generický styled dropdown (nahrazuje `<select>` v paginaci)
- Všechny custom selecty zavírají dropdown po výběru i kliknutím mimo komponentu

### Nastavení aplikace
- Téma (tmavé / světlé)
- Jazyk (čeština / angličtina)
- Formát datumu (DD.MM.YYYY / YYYY-MM-DD)
- Formát času (24h / 12h)
- Vše persistováno v `localStorage`

---

## Testování

### Backend (JUnit 5 + Mockito)

`InvoiceServiceImplTest` — 7 unit testů:
- Throws při null buyer / seller
- Throws při null buyer.id / seller.id
- Throws když buyer == seller
- Throws když dueDate je před issued
- Throws při záporné ceně / DPH

`PersonServiceImplTest` — 5 unit testů:
- getAll vrací pouze viditelné osoby
- removePerson nastaví hidden = true (soft-delete)
- removePerson tiše selže pokud osoba neexistuje
- getPersonById vyhodí EntityNotFoundException
- addPerson uloží a vrátí DTO

### Frontend (Vitest + Testing Library)

`PersonSelect.test.jsx` — 5 testů:
- Zobrazí placeholder při prázdné hodnotě
- Zobrazí jméno vybrané osoby
- Otevře dropdown po kliknutí
- Zobrazí možnost „Vytvořit novou osobu"
- Zavolá onChange po výběru osoby

---

## Project Highlights

### Architektura
- Striktní vrstvená architektura bez přeskakování vrstev
- DTO pattern s MapStruct — JPA entity nikdy neprocházejí přes HTTP vrstvu
- `BusinessException` odlišena od technických výjimek — různé HTTP statusy (422 vs 500)
- Vlastní `ErrorResponseDTO` se sjednocenou strukturou pro všechny typy chyb
- JPA Specification použita jak pro faktury, tak pro osoby — konzistentní přístup k filtrování

### Reusable komponenty
- `usePagination` hook — stránkování s automatickou korekcí stránky po smazání záznamu
- `ToastContext` — globální toast systém dostupný v celé aplikaci přes React Context
- `ConfirmModal` — generický potvrzovací dialog s Escape klávesou, focus managementem a overlay
- Custom selecty (`PersonSelect`, `CountrySelect`, `DateInput`) — konzistentní design, bez knihovny

### Validace
- Dvouúrovňová validace: Bean Validation (400) + business logika (422)
- Frontend parsuje `validationErrors` mapu a zobrazuje zprávy inline u polí
- Scroll + focus + pulse animace na první chybné pole při submit — bez browser validace

### UX přístup
- Žádný `window.confirm`, `alert()` ani browser popup — vše řeší vlastní komponenty
- Toast progress: loading → success/error při každé mutační operaci
- Optimistic updates zachovávají plynulost UI, rollback chrání integritu dat
- Debounce vyhledávání v PersonSelect — filtr se spustí až po 300ms pauze

### Čistota řešení
- Konzistentní kódový styl a pojmenování napříč backendem i frontendem
- CSS design systém postavený výhradně na CSS Custom Properties — bez CSS frameworku
- Skeleton loading respektuje skutečný layout — žádné generické loadery
- Všechny komentáře v kódu jsou česky, stručné a vysvětlují „proč", ne „co"

---

## Co jsem v projektu řešil

### Backend
- **Bean Validation** — validační anotace na DTO vrstvě, aktivace přes `@Valid` v controllerech
- **Business validace** — `BusinessException` pro doménové chyby vs. `EntityNotFoundException` pro 404
- **Sjednocený error response** — `ErrorResponseDTO` s `timestamp`, `status`, `message`, `path`, `validationErrors`
- **JPA Specification** — dynamická filtrace faktur i osob bez pevně napsaných JPQL dotazů
- **Soft-delete** — osoby se nesmažou fyzicky, ale nastaví se `hidden = true`
- **Aggregate dotazy** — statistiky přes `@Query` (COUNT, SUM) místo načítání všech entit do paměti
- **Revenue přehled** — JPQL join dotaz pro výpočet tržeb osob za zvolený rok
- **CSV export** — `ExportController` generuje soubory s UTF-8 BOM pro kompatibilitu s MS Excel
- **Unit testy** — Mockito pro izolaci service vrstvy od databáze

### Frontend
- **Vlastní fetch wrapper** — `api.js` parsuje `ErrorResponseDTO`, hází `ApiError` s `validationErrors` polem
- **Error handling ve formulářích** — `parseApiError()`, inline zobrazení chyb, scroll na první chybné pole
- **Toast systém** — Context API, typy toastů, `updateToast()` pro přechod loading → success/error
- **Optimistic updates** — okamžitá změna UI, rollback při selhání API
- **Skeleton loading** — CSS shimmer animace místo spinneru, layout odpovídá skutečnému obsahu
- **Custom selecty** — PersonSelect s debounce a inline vytvořením osoby, DateInput s custom kalendářem
- **Settings** — ukládání předvoleb do `localStorage`, napojení na DateInput (formát) a TopBarClock (formát času)
- **Sidebar fix** — `SidebarLinkInvoices` komponenta řeší aktivní stav Faktury / Statistiky bez konfliktu

---

## Možná budoucí rozšíření

- Autentizace a autorizace (Spring Security, JWT)
- Export faktur do PDF
- Emailové notifikace při blížící se splatnosti
- Vícejazyčné rozhraní (i18n)
- Rozšíření evidence zemí
- Integrační testy (Spring Boot Test + Testcontainers)

---

## Autor

**Ondřej Kučera**

> Portfoliový projekt | Kurz JAVA PRO developer — [ITnetwork.cz](https://www.itnetwork.cz)

---

<div align="center">
  <sub>🟣 Okvion v6.10 &nbsp;·&nbsp; Java 17 · Spring Boot 3.1 · React 18 · Vite 6 · MySQL</sub>
</div>
