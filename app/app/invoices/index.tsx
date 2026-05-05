import { Redirect } from 'expo-router';

// Canonical invoice list lives in the dashboard tabs.
export default function InvoiceListRedirect() {
    return <Redirect href="/(dashboard)/invoices" />;
}
