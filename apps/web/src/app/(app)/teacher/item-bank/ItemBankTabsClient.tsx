"use client";

import React, { useState } from "react";
import { useTeacherAuth } from "@/lib/teacherAuth";
import ItemBankClient from "./ItemBankClient";
import PrivateBankClient from "@/components/teacher/PrivateBankClient";
import type { Item } from "@/lib/itemBank/schema";

type Tab = "public" | "my-questions";

export default function ItemBankTabsClient({
  publicItems,
}: {
  publicItems: Item[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("public");
  const { teacher } = useTeacherAuth();

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex items-center gap-1 rounded-xl border border-[var(--bs-border)] bg-bs-surface p-1 shadow-sm w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("public")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 ${
            activeTab === "public"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-bs-text-sub hover:bg-[var(--bs-raised)]"
          }`}
          aria-pressed={activeTab === "public"}
        >
          Public
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("my-questions")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 ${
            activeTab === "my-questions"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-bs-text-sub hover:bg-[var(--bs-raised)]"
          }`}
          aria-pressed={activeTab === "my-questions"}
        >
          My Questions
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "public" && <ItemBankClient items={publicItems} />}

      {activeTab === "my-questions" && (
        teacher ? (
          <PrivateBankClient teacherId={teacher.email} />
        ) : (
          <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-8 text-center text-sm text-bs-text-sub shadow-sm">
            Loading your questions...
          </div>
        )
      )}
    </div>
  );
}
