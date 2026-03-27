# Invoice App – Verze 2 (Full-Stack)

Jednoduchá CRUD aplikace pro správu osob a faktur (fakturační systém).

| Vrstva    | Technologie                      |
|-----------|----------------------------------|
| Backend   | Java 17 · Spring Boot 3 · Maven  |
| Databáze  | MySQL přes XAMPP (port 3306)     |
| Frontend  | React · Vite (port 3000)         |
| Testování | Postman + prohlížeč              |

---

## 📁 Struktura projektu

```
invoice-app/
├── backend/          ← Spring Boot aplikace (MySQL + REST API)
├── frontend/         ← React aplikace (Vite)
└── README.md
```

---

## 🚀 Spuštění krok za krokem

### 1. Databáze – spusť MySQL v XAMPP

1. Otevři **XAMPP Control Panel**
2. Klikni **Start** u řádku **MySQL**
3. MySQL poběží na `localhost:3306`
4. Databáze `invoice_app` se vytvoří **automaticky** při prvním spuštění backendu

> ⚠️ XAMPP MySQL musí běžet **před** spuštěním backendu.

---

### 2. Backend – spusť Spring Boot (port 8080)

**Předpoklady:** Java 17+, Maven 3.6+

```bash
cd backend
mvn spring-boot:run
```

Nebo v IDE (IntelliJ / Eclipse):
- Otevři projekt ze složky `backend/`
- Spusť třídu `ApplicationMain.java`

**Ověření:** Otevři v prohlížeči → [http://localhost:8080/api/persons](http://localhost:8080/api/persons)
Měl by se vrátit prázdný JSON array `[]`.

**Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

### 3. Frontend – spusť React aplikaci (port 3000)

**Předpoklady:** Node.js 18+, npm

```bash
cd frontend
npm install
npm start
```

Aplikace se otevře na: [http://localhost:3000](http://localhost:3000)

> Frontend volá API na `http://localhost:8080/api/persons` a `http://localhost:8080/api/invoices` – backend musí běžet.

---

## 🧪 Testování

### Přes prohlížeč
Otevři [http://localhost:3000](http://localhost:3000) a používej React UI.

### Přes Postman

#### Osoby

| Metoda   | URL                                    | Popis                  |
|----------|----------------------------------------|------------------------|
| `GET`    | `http://localhost:8080/api/persons`    | Seznam všech osob      |
| `GET`    | `http://localhost:8080/api/persons/1`  | Detail osoby (ID = 1)  |
| `POST`   | `http://localhost:8080/api/persons`    | Vytvoření nové osoby   |
| `PUT`    | `http://localhost:8080/api/persons/1`  | Úprava osoby (ID = 1)  |
| `DELETE` | `http://localhost:8080/api/persons/1`  | Smazání osoby (ID = 1) |

**Příklad POST těla (JSON):**
```json
{
  "name": "Jan Novák",
  "identificationNumber": "12345678",
  "taxNumber": "CZ12345678",
  "telephone": "+420 777 000 000",
  "mail": "jan.novak@example.cz",
  "street": "Hlavní 1",
  "zip": "110 00",
  "city": "Praha",
  "country": "CZECHIA"
}
```

#### Faktury

| Metoda   | URL                                                        | Popis                           |
|----------|------------------------------------------------------------|---------------------------------|
| `GET`    | `http://localhost:8080/api/invoices`                       | Seznam všech faktur             |
| `GET`    | `http://localhost:8080/api/invoices/1`                     | Detail faktury (ID = 1)         |
| `POST`   | `http://localhost:8080/api/invoices`                       | Vytvoření nové faktury          |
| `PUT`    | `http://localhost:8080/api/invoices/1`                     | Úprava faktury (ID = 1)         |
| `DELETE` | `http://localhost:8080/api/invoices/1`                     | Smazání faktury (ID = 1)        |
| `GET`    | `http://localhost:8080/api/invoices/sales/{personId}`      | Vystavené faktury osoby         |
| `GET`    | `http://localhost:8080/api/invoices/purchases/{personId}`  | Přijaté faktury osoby           |

**Příklad POST těla (JSON):**
```json
{
  "invoiceNumber": 1001,
  "issued": "2026-03-27",
  "dueDate": "2026-04-10",
  "product": "Webové služby",
  "price": 15000,
  "vat": 21,
  "note": "Test faktura",
  "buyer": { "_id": 1 },
  "seller": { "_id": 2 }
}
```

---

## ⚙️ Konfigurace databáze

Soubor: `backend/src/main/resources/application.yaml`

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/invoice_app?createDatabaseIfNotExist=true
    username: root
    password:          # výchozí XAMPP heslo je prázdné
```

Pokud máš nastavené jiné heslo pro MySQL, uprav pole `password`.

---

## 🔌 REST API endpointy

#### Osoby

```
GET    /api/persons        → seznam všech osob (hidden=false)
GET    /api/persons/{id}   → detail osoby
POST   /api/persons        → vytvoření osoby  (201 Created)
PUT    /api/persons/{id}   → úprava osoby
DELETE /api/persons/{id}   → soft-delete (hidden=true, 204 No Content)
```

#### Faktury

```
GET    /api/invoices                        → seznam všech faktur
GET    /api/invoices/{id}                   → detail faktury
POST   /api/invoices                        → vytvoření faktury  (201 Created)
PUT    /api/invoices/{id}                   → úprava faktury
DELETE /api/invoices/{id}                   → smazání faktury (204 No Content)
GET    /api/invoices/sales/{personId}       → vystavené faktury osoby
GET    /api/invoices/purchases/{personId}   → přijaté faktury osoby
```

---

## 🗂️ Funkcionalita

### Osoby
- Vytvoření, seznam, detail, úprava, smazání osoby
- Soft-delete: osoba se označí jako `hidden=true`, v databázi zůstane

### Faktury
- **Vytvoření** – nová faktura s vazbou na kupujícího a prodávajícího
- **Seznam** – přehled všech faktur
- **Detail** – zobrazení konkrétní faktury
- **Úprava** – editace existující faktury
- **Smazání** – odstranění faktury z databáze
- **Vystavené** – faktury, kde je osoba prodávající (`seller`)
- **Přijaté** – faktury, kde je osoba kupující (`buyer`)

---

## 🔗 Relace

- Každá faktura obsahuje vazbu na dvě osoby:
  - **`buyer`** – kupující (odkaz na osobu)
  - **`seller`** – prodávající (odkaz na osobu)
- Obě vazby jsou povinné při vytváření faktury

---

## 📦 Technické detaily

- **Soft-delete (osoby):** Smazaná osoba se označí jako `hidden=true`, ale v databázi zůstane
- **CORS:** Povoleno pro všechny originy (vhodné pro lokální vývoj)
- **Tabulky:** Vytváří se automaticky (`ddl-auto: update`)
- **Port backendu:** 8080
- **Port frontendu:** 3000 (Vite výchozí)

---

## 🧠 Použité principy

- REST API design
- DTO + Mapper (MapStruct)
- Separation of Concerns (Controller / Service / Repository)
- Relace mezi entitami (JPA)
