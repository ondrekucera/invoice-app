import React from "react";
import { Link } from "react-router-dom";

import { dateStringFormatter } from "../utils/dateStringFormatter";

const InvoiceTable = ({ label, items }) => {
    return (
        <div>
            <p>
                {label} {items.length}
            </p>

            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Číslo faktury</th>
                        <th>Vystavena</th>
                        <th>Splatnost</th>
                        <th>Produkt</th>
                        <th>Cena</th>
                        <th>Dodavatel</th>
                        <th>Odběratel</th>
                        <th>Akce</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={item._id}>
                            <td>{index + 1}</td>
                            <td>{item.invoiceNumber}</td>
                            <td>{dateStringFormatter(item.issued, true)}</td>
                            <td>{dateStringFormatter(item.dueDate, true)}</td>
                            <td>{item.product}</td>
                            <td>{item.price} Kč</td>
                            <td>
                                <Link to={"/persons/show/" + item.seller._id}>
                                    {item.seller.name}
                                </Link>
                            </td>
                            <td>
                                <Link to={"/persons/show/" + item.buyer._id}>
                                    {item.buyer.name}
                                </Link>
                            </td>
                            <td>
                                <Link
                                    to={"/invoices/show/" + item._id}
                                    className="btn btn-sm btn-info"
                                >
                                    Zobrazit
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Link to={"/invoices/create"} className="btn btn-success">
                Nová faktura
            </Link>
        </div>
    );
};

export default InvoiceTable;
