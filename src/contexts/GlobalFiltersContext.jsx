"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { getDefaultReportDates } from "@/utils/analyticsReportUtils";

const GlobalFiltersContext = createContext(null);
const STORAGE_KEY = "cossim-global-filters";

export function GlobalFiltersProvider({ children }) {
  const defaults = getDefaultReportDates();
  const [filters, setFilters] = useState({
    startDate: defaults.startDate,
    endDate: defaults.endDate,
    vendorCode: "",
    dcCode: "",
  });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved) setFilters((current) => ({ ...current, ...saved }));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const value = useMemo(() => ({
    filters,
    setFilter: (key, value) => setFilters((current) => ({ ...current, [key]: value })),
    setFilters,
  }), [filters]);

  return <GlobalFiltersContext.Provider value={value}>{children}</GlobalFiltersContext.Provider>;
}

GlobalFiltersProvider.propTypes = { children: PropTypes.node.isRequired };

export function useGlobalFilters() {
  const context = useContext(GlobalFiltersContext);
  if (!context) throw new Error("useGlobalFilters must be used within GlobalFiltersProvider");
  return context;
}
