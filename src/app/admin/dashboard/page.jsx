"use client";

import { ShipmentOrderReport } from "@/components/reports/ShipmentOrderReport";
import { useUser } from "@/hooks/useUser";

const DashboardPage = () => {
  const { user } = useUser();
  const name = [user?.FirstName, user?.LastName].filter(Boolean).join(" ");

  return (
    <ShipmentOrderReport
      pageTitle={`Welcome, ${name || "Admin"}`}
      pageEyebrow="Admin Dashboard"
    />
  );
};

export default DashboardPage;
