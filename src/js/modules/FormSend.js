/**
 * Чистый транспорт. Не управляет UI.
 */
export class FormSend {
    #defaultHeaders;

    constructor(defaultHeaders = {}) {
        this.#defaultHeaders = defaultHeaders;
    }

    async send(url, method = "POST", formData = null, headers = {}) {
        const finalHeaders = {
            Accept: "application/json",
            ...this.#defaultHeaders,
            ...headers,
        };

        const upper = (method || "POST").toUpperCase();
        let fetchUrl = url || "";
        const options = { method: upper, headers: finalHeaders };

        if (upper === "GET" && formData) {
            const usp = new URLSearchParams();
            for (const [k, v] of formData.entries()) usp.append(k, v);
            const sep = fetchUrl.includes("?") ? "&" : "?";
            fetchUrl += `${sep}${usp.toString()}`;
        } else if (formData) {
            options.body = formData;
        }

        const response = await fetch(fetchUrl, options);
        const contentType = String(response.headers.get("content-type") || "");
        const payload = contentType.includes("application/json")
            ? await response.json().catch(() => ({}))
            : await response.text().catch(() => "");

        if (!response.ok) {
            const err = new Error("RequestFailed");
            err.status = response.status;
            err.data = payload;
            throw err;
        }

        return { ok: true, data: payload, status: response.status };
    }
}
