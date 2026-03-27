import React, { useEffect, useState } from "react";

import { apiGet } from "../utils/api";

const InvoiceStatistics = () => {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet("/api/invoices/statistics").then((data) => {
            setStatistics(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <p>Načítám statistiky...</p>;
    }

    return (
        <div>
            <h1>Statistiky faktur</h1>
            <hr />
            <table className="table table-bordered w-auto">
                <tbody>
                    <tr>
                        <th>Počet faktur</th>
                        <td>{statistics.invoiceCount}</td>
                    </tr>
                    <tr>
                        <th>Celková částka</th>
                        <td>{statistics.invoicesSum.toLocaleString("cs-CZ")} Kč</td>
                    </tr>
                    <tr>
                        <th>Průměrná částka</th>
                        <td>{statistics.invoicesAverage.toLocaleString("cs-CZ")} Kč</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default InvoiceStatistics;
