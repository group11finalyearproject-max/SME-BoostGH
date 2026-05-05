import { Redirect } from 'expo-router';

// Canonical customer list lives in the dashboard tabs.
export default function CustomerListRedirect() {
    return <Redirect href="/(dashboard)/crm" />;
}
