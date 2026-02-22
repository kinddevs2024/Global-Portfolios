"use client";

export default function UniversityChatsPage() {
    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <h1 className="text-2xl font-bold text-amber-900">Chats</h1>
            <div className="relative">
                <input
                    type="search"
                    placeholder="Search Chats"
                    className="w-full rounded-xl border border-amber-200 px-4 py-3 pl-10"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500">🔍</span>
            </div>
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-amber-200 bg-white p-12">
                <div className="flex gap-4 text-6xl opacity-30">
                    <span>💬</span>
                    <span>💬</span>
                </div>
                <p className="mt-6 text-lg text-gray-500">It&apos;s quiet here... for now</p>
                <p className="mt-2 text-sm text-gray-400">Start a conversation with a student after accepting their application.</p>
            </div>
        </div>
    );
}
