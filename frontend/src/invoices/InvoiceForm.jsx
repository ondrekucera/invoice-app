import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiGet, apiPost } from "../utils/api";
import InputField from "../components/InputField";
import InputSelect from "../components/InputSelect";
import FlashMessage from "../components/FlashMessage";

const InvoiceForm = () => {
    const navigate = useNavigate();
    const [persons, setPersons] = useState([]);
    const [invoice, setInvoice] = useState({
        invoiceNumber: "",
        issued: "",
        dueDate: "",
        product: "",
        price: "",
        vat: "",
        note: "",
        buyer: { _id: "" },
        seller: { _id: "" },
    });
    const [sentState, setSent] = useState(false);
    const [successState, setSuccess] = useState(false);
    const [errorState, setError] = useState(null);

    useEffect(() => {
        apiGet("/api/persons").then((data) => setPersons(data));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        apiPost("/api/invoices", invoice)
            .then(() => {
                setSent(true);
                setSuccess(true);
                navigate("/invoices");
            })
            .catch((error) => {
                console.log(error.message);
                setError(error.message);
                setSent(true);
                setSuccess(false);
            });
    };

    return (
        <div>
            <h1>Vytvořit fakturu</h1>
            <hr />
            {errorState && (
                <div className="alert alert-danger">{errorState}</div>
            )}
            {sentState && (
                <FlashMessage
                    theme={successState ? "success" : ""}
                    text={successState ? "Faktura byla úspěšně uložena." : ""}
                />
            )}
            <form onSubmit={handleSubmit}>
                <InputField
                    required={true}
                    type="number"
                    name="invoiceNumber"
                    label="Číslo faktury"
                    prompt="Zadejte číslo faktury"
                    value={invoice.invoiceNumber}
                    handleChange={(e) =>
                        setInvoice({ ...invoice, invoiceNumber: e.target.value })
                    }
                />

                <InputField
                    required={true}
                    type="date"
                    name="issued"
                    label="Datum vystavení"
                    value={invoice.issued}
                    handleChange={(e) =>
                        setInvoice({ ...invoice, issued: e.target.value })
                    }
                />

                <InputField
                    required={true}
                    type="date"
                    name="dueDate"
                    label="Datum splatnosti"
                    value={invoice.dueDate}
                    handleChange={(e) =>
                        setInvoice({ ...invoice, dueDate: e.target.value })
                    }
                />

                <InputField
                    required={true}
                    type="text"
                    name="product"
                    label="Produkt"
                    prompt="Zadejte název produktu"
                    value={invoice.product}
                    handleChange={(e) =>
                        setInvoice({ ...invoice, product: e.target.value })
                    }
                />

                <InputField
                    required={true}
                    type="number"
                    name="price"
                    label="Cena (Kč)"
                    prompt="Zadejte cenu"
                    value={invoice.price}
                    handleChange={(e) =>
                        setInvoice({ ...invoice, price: e.target.value })
                    }
                />

                <InputField
                    required={true}
                    type="number"
                    name="vat"
                    label="DPH (%)"
                    prompt="Zadejte DPH"
                    value={invoice.vat}
                    handleChange={(e) =>
                        setInvoice({ ...invoice, vat: e.target.value })
                    }
                />

                <InputField
                    type="textarea"
                    name="note"
                    label="Poznámka"
                    value={invoice.note}
                    handleChange={(e) =>
                        setInvoice({ ...invoice, note: e.target.value })
                    }
                />

                <InputSelect
                    required={true}
                    name="seller"
                    label="Dodavatel"
                    prompt="Vyberte dodavatele"
                    items={persons}
                    value={invoice.seller._id}
                    handleChange={(e) =>
                        setInvoice({
                            ...invoice,
                            seller: { _id: e.target.value },
                        })
                    }
                />

                <InputSelect
                    required={true}
                    name="buyer"
                    label="Odběratel"
                    prompt="Vyberte odběratele"
                    items={persons}
                    value={invoice.buyer._id}
                    handleChange={(e) =>
                        setInvoice({
                            ...invoice,
                            buyer: { _id: e.target.value },
                        })
                    }
                />

                <input
                    type="submit"
                    className="btn btn-primary mt-2"
                    value="Uložit"
                />
            </form>
        </div>
    );
};

export default InvoiceForm;
