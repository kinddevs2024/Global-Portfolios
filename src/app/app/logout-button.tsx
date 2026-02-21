"use client";

export default function LogoutButton() {
    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
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
