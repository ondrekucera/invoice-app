import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiGet } from "../utils/api";
import { dateStringFormatter } from "../utils/dateStringFormatter";

const InvoiceDetail = () => {
    const { id } = useParams();
    const [invoice, setInvoice] = useState({
        buyer: {},
        seller: {},
    });

    useEffect(() => {
        apiGet("/api/invoices/" + id).then((data) => setInvoice(data));
    }, [id]);

    return (
        <>
            <h1>Detail faktury</h1>
            <hr />
            <h3>Faktura č. {invoice.invoiceNumber}</h3>
            <p>
                <strong>Produkt:</strong>
                <br />
                {invoice.product}
            </p>
            <p>
                <strong>Cena:</strong>
                <br />
                {invoice.price} Kč
            </p>
            <p>
                <strong>DPH:</strong>
                <br />
                {invoice.vat} %
            </p>
            <p>
                <strong>Datum vystavení:</strong>
                <br />
                {invoice.issued && dateStringFormatter(invoice.issued, true)}
            </p>
            <p>
                <strong>Datum splatnosti:</strong>
                <br />
                {invoice.dueDate && dateStringFormatter(invoice.dueDate, true)}
            </p>
            <p>
                <strong>Poznámka:</strong>
                <br />
                {invoice.note}
            </p>
            <p>
                <strong>Dodavatel:</strong>
                <br />
                {invoice.seller && (
                    <Link to={"/persons/show/" + invoice.seller._id}>
                        {invoice.seller.name}
                    </Link>
                )}
            </p>
            <p>
                <strong>Odběratel:</strong>
                <br />
                {invoice.buyer && (
                    <Link to={"/persons/show/" + invoice.buyer._id}>
                        {invoice.buyer.name}
                    </Link>
                )}
            </p>
        </>
    );
};

export default InvoiceDetail;
