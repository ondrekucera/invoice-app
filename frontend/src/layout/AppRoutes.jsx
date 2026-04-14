import { Routes, Route, Navigate } from "react-router-dom";

import PersonIndex   from "../persons/PersonIndex";
import PersonDetail  from "../persons/PersonDetail";
import PersonForm    from "../persons/PersonForm";
import InvoiceIndex      from "../invoices/InvoiceIndex";
import InvoiceDetail     from "../invoices/InvoiceDetail";
import InvoiceForm       from "../invoices/InvoiceForm";
import InvoiceStatistics from "../invoices/InvoiceStatistics";
import ExpenseIndex  from "../expenses/ExpenseIndex";
import ExpenseDetail from "../expenses/ExpenseDetail";
import ExpenseForm   from "../expenses/ExpenseForm";
import HomePage     from "../pages/HomePage";
import SettingsPage from "../pages/SettingsPage";

/**
 * Definice všech route aplikace.
 * Odděleno od App.jsx, aby byl routing snadno přehledný na jednom místě.
 */
export function AppRoutes({ theme, onThemeChange }) {
  return (
    <Routes>
      <Route index element={<Navigate to="/home" />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/settings" element={<SettingsPage theme={theme} onThemeChange={onThemeChange} />} />

      <Route path="/persons">
        <Route index           element={<PersonIndex />} />
        <Route path="show/:id" element={<PersonDetail />} />
        <Route path="create"   element={<PersonForm />} />
        <Route path="edit/:id" element={<PersonForm />} />
      </Route>

      <Route path="/expenses">
        <Route index           element={<ExpenseIndex />} />
        <Route path="show/:id" element={<ExpenseDetail />} />
        <Route path="create"   element={<ExpenseForm />} />
        <Route path="edit/:id" element={<ExpenseForm />} />
      </Route>

      <Route path="/invoices">
        <Route index                      element={<InvoiceIndex />} />
        <Route path="show/:id"            element={<InvoiceDetail />} />
        <Route path="create"              element={<InvoiceForm />} />
        <Route path="edit/:id"            element={<InvoiceForm />} />
        <Route path="statistics"          element={<InvoiceStatistics />} />
        <Route path="sales/:personId"     element={<InvoiceIndex type="sales" />} />
        <Route path="purchases/:personId" element={<InvoiceIndex type="purchases" />} />
      </Route>
    </Routes>
  );
}
