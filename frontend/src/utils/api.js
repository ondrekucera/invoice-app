/*  _____ _______         _                      _
 * |_   _|__   __|       | |                    | |
 *   | |    | |_ __   ___| |___      _____  _ __| | __  ___ ____
 *   | |    | | '_ \ / _ \ __\ \ /\ / / _ \| '__| |/ / / __|_  /
 *  _| |_   | | | | |  __/ |_ \ V  V / (_) | |  |   < | (__ / /
 * |_____|  |_|_| |_|\___|\__| \_/\_/ \___/|_|  |_|\_(_)___/___|
 *                                _
 *              ___ ___ ___ _____|_|_ _ _____
 *             | . |  _| -_|     | | | |     |  LICENCE
 *             |  _|_| |___|_|_|_|_|___|_|_|_|
 *             |_|
 *
 *   PROGRAMOVÁNÍ  <>  DESIGN  <>  PRÁCE/PODNIKÁNÍ  <>  HW A SW
 *
 * Tento zdrojový kód je součástí výukových seriálů na
 * IT sociální síti WWW.ITNETWORK.CZ
 *
 * Kód spadá pod licenci prémiového obsahu a vznikl díky podpoře
 * našich členů. Je určen pouze pro osobní užití a nesmí být šířen.
 * Více informací na http://www.itnetwork.cz/licence
 */

const API_URL = "http://localhost:8080";

// Zpracuje response – při chybě vyhodí ApiError s daty z ErrorResponseDTO
const fetchData = async (url, requestOptions) => {
    const apiUrl = `${API_URL}${url}`;

    let response;
    try {
        response = await fetch(apiUrl, requestOptions);
    } catch (networkError) {
        throw new ApiError("Server není dostupný. Zkontrolujte připojení.", null, null);
    }

    // DELETE vrací 204 No Content – tělo neočekáváme
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
        // Pokud backend vrátil validationErrors (400), předáme je celé
        const validationErrors = data?.validationErrors ?? null;
        const message = data?.message || `Chyba: ${response.status}`;
        throw new ApiError(message, validationErrors, response.status);
    }

    return data;
};

// Vlastní třída chyby – nese message, validationErrors a HTTP status
export class ApiError extends Error {
    constructor(message, validationErrors = null, status = null) {
        super(message);
        this.name = "ApiError";
        this.validationErrors = validationErrors;
        this.status = status;
    }
}

// Helper pro formuláře – extrahuje message a validationErrors z chyby
export const parseApiError = (error) => {
    if (error instanceof ApiError) {
        return {
            message: error.message,
            validationErrors: error.validationErrors || null,
        };
    }
    return {
        message: error?.message || "Neznámá chyba.",
        validationErrors: null,
    };
};

export const apiGet = (url, params) => {
    const filteredParams = Object.fromEntries(
        Object.entries(params || {}).filter(([_, value]) => value != null)
    );
    const apiUrl = `${url}?${new URLSearchParams(filteredParams)}`;
    return fetchData(apiUrl, { method: "GET" });
};

export const apiPost = (url, data) => {
    return fetchData(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
};

export const apiPut = (url, data) => {
    return fetchData(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
};

export const apiDelete = (url) => {
    return fetchData(url, { method: "DELETE" });
};
