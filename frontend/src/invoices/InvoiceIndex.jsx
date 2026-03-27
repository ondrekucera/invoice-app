import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { apiGet } from "../utils/api";
import InvoiceTable from "./InvoiceTable";

const InvoiceIndex = ({ type }) => {
    const { personId } = useParams();
    const [invoices, setInvoices] = useState([]);

    const getTitle = () => {
        if (type === "sales") return "Vystavené faktury";
        if (type === "purchases") return "Přijaté faktury";
        return "Seznam faktur";
    };

    const loadInvoices = () => {
        let url = "/api/invoices";
        if (personId && type === "sales") {
            url = "/api/invoices/sales/" + personId;
        } else if (personId && type === "purchases") {
            url = "/api/invoices/purchases/" + personId;
        }
        apiGet(url).then((data) => setInvoices(data));
    };

    useEffect(() => {
        loadInvoices();
    }, [personId, type]);

    return (
        <div>
            <h1>{getTitle()}</h1>
            <InvoiceTable
                items={invoices}
                label="Počet faktur:"
                onDelete={loadInvoices}
            />
        </div>
    );
};

export default InvoiceIndex;
