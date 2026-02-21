"use client";

export default function LogoutButton() {
    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch {
            // ignore storage cleanup errors
        }
        window.location.assign("/");
    }

    return (
        <button
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
            onClick={handleLogout}
            type="button"
        >
            Выйти
        </button>
    );
}
