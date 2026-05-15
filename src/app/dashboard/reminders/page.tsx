import { getExpired, getUpcoming } from "@/actions/reminders";
import { PageHeader } from "@/components/ui/page-header";
import { RemindersList } from "@/components/dashboard/RemindersList";
import type { Metadata } from "next";
import type { ReminderWithVehicle } from "@/types/domain";

export const metadata: Metadata = { title: "Recordatorios" };

export default async function RemindersPage() {
  const [expiredResult, upcomingResult] = await Promise.all([
    getExpired(),
    getUpcoming(),
  ]);

  const expired: ReminderWithVehicle[]  = expiredResult.success  ? expiredResult.data  : [];
  const upcoming: ReminderWithVehicle[] = upcomingResult.success ? upcomingResult.data : [];

  const totalActive = expired.length + upcoming.length;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <PageHeader
        title="Recordatorios"
        description={
          totalActive === 0
            ? "Todo al día. Sin alertas pendientes."
            : `${totalActive} alerta${totalActive !== 1 ? "s" : ""} activa${totalActive !== 1 ? "s" : ""}`
        }
      />
      <RemindersList expired={expired} upcoming={upcoming} />
    </div>
  );
}