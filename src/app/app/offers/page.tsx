"use client";

import Link from "next/link";

export default function OffersPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Offers</h1>
            <p className="text-gray-600">
                Приглашения и офферы от университетов. Управление заявками и откликами.
            </p>
            <div className="card p-6">
                <p className="text-sm text-gray-600 mb-4">
                    Здесь отображаются приглашения от университетов и ваши отклики.
                </p>
                <Link
                    href="/app/applications"
                    className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                    Перейти к заявкам и интересам
                </Link>
            </div>
        </div>
    );
}
