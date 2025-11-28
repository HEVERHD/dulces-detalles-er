// app/admin/login/page.tsx
import AdminLoginClient from "./AdminLoginClient";

type LoginPageProps = {
    searchParams?: {
        from?: string;
    };
};

export default function AdminLoginPage({ searchParams }: LoginPageProps) {
    const from = searchParams?.from;

    const redirectTo =
        typeof from === "string" && from.length > 0
            ? from
            : "/admin/productos";

    return <AdminLoginClient redirectTo={redirectTo} />;
}
