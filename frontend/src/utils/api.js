// API URL se načítá z .env souboru – viz VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

/**
 * Interní fetch wrapper. Zpracovává JSON odpovědi a při chybě vyhazuje ApiError.
 * DELETE požadavky očekávají 204 No Content – tělo odpovědi se nečte.
 */
const fetchData = async (url, requestOptions) => {
    const fullUrl = `${API_URL}${url}`;

    let response;
    try {
        response = await fetch(fullUrl, requestOptions);
    } catch {
        // Síťová chyba (server nedostupný, CORS, timeout)
        throw new ApiError("Server není dostupný. Zkontrolujte připojení.", null, null);
    }

    if (requestOptions.method === "DELETE") {
        if (!response.ok) {
            let data = null;
            try { data = await response.json(); } catch {}
            throw new ApiError(data?.message || "Chyba při mazání.", data?.validationErrors || null, response.status);
        }
        return;
    }

    let data = null;
    try {
        data = await response.json();
    } catch {
        if (!response.ok) {
            throw new ApiError(`Chyba serveru: ${response.status}`, null, response.status);
        }
        return;
    }

    if (!response.ok) {
        // HTTP 400 může obsahovat validationErrors – předáme je celé pro zobrazení ve formuláři
        const validationErrors = data?.validationErrors ?? null;
        const message = data?.message || `Chyba: ${response.status}`;
        throw new ApiError(message, validationErrors, response.status);
    }

    return data;
};

/**
 * Vlastní třída chyby – nese message, validationErrors a HTTP status vedle sebe.
 * Umožňuje volajícímu rozlišit typ chyby bez parsování zprávy.
 */
export class ApiError extends Error {
    constructor(message, validationErrors = null, status = null) {
        super(message);
        this.name             = "ApiError";
        this.validationErrors = validationErrors;
        this.status           = status;
    }
}

/** Extrahuje message a validationErrors z libovolné vyhozené chyby. Použij v submit handlerech. */
export const parseApiError = (error) => {
    if (error instanceof ApiError) {
        return {
            message:          error.message,
            validationErrors: error.validationErrors || null,
        };
    }
    return {
        message:          error?.message || "Neznámá chyba.",
        validationErrors: null,
    };
};

/** Zkratka pro získání čitelné chybové zprávy. */
export const getErrorMessage = (error) => parseApiError(error).message;

export const apiGet = (url, params) => {
    // Vyfiltrujeme null/undefined/prázdné hodnoty – nevznikají zbytečné query parametry
    const filteredParams = Object.fromEntries(
        Object.entries(params || {}).filter(([, value]) => value != null && value !== "")
    );
    const queryString = new URLSearchParams(filteredParams).toString();
    return fetchData(`${url}?${queryString}`, { method: "GET" });
};

export const apiPost = (url, data) =>
    fetchData(url, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
    });

export const apiPut = (url, data) =>
    fetchData(url, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
    });

export const apiDelete = (url) =>
    fetchData(url, { method: "DELETE" });
