"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { useVendorProducts } from "@/hooks/useVendorProducts";
import { readAnalyticsArray, readAnalyticsValue } from "@/utils/analyticsReportUtils";
import styles from "./stock-take.module.scss";

const number = (value) => Number(value || 0).toLocaleString("en-KE");
const firstValue = (source, keys, fallback = 0) => {
  for (const key of keys) {
    const value = readAnalyticsValue(source, key);
    if (value !== undefined && value !== null) return value;
  }
  return fallback;
};

function StockTable({ rows }) {
  return <div className={styles.table}><div><b>Distribution Centre</b><b>Opening</b><b>Received</b><b>Delivered</b><b>1st Attempt</b><b>2nd Attempt</b><b>Cancelled/ Reversed</b><b>Return Enroute</b><b>Expected</b><b>Daily Stock Count</b><b>Status</b></div>{rows.length ? rows.map((row) => <div key={row.dcCode}><strong>{row.dcCode}</strong><span>{number(row.opening)}</span><span>{number(row.received)}</span><span>{number(row.delivered)}</span><span>{number(row.firstAttempt)}</span><span>{number(row.secondAttempt)}</span><span>{number(row.cancelled)}</span><span>{number(row.returnEnroute)}</span><span>{number(row.expected)}</span><span>{number(row.dailyStock)}</span><span>{row.status}</span></div>) : <div className={styles.empty}>No distribution centre data available</div>}</div>;
}

function ProductTable({ rows }) {
  const columns = { gridTemplateColumns: "minmax(110px,1fr) minmax(180px,1.8fr) repeat(6,minmax(90px,1fr))", minWidth: 900 };
  return <div className={styles.table}><div style={columns}><b>Product Code</b><b>Product Name</b><b>Current Price</b><b>Product Value</b><b>Fragile</b><b>Perishable</b><b>Status</b><b>Date Added</b></div>{rows.length ? rows.map((row) => <div style={columns} key={row.vendorProductCode}><strong>{row.vendorProductCode}</strong><span>{row.vendorProductName || "—"}</span><span>KES {number(row.currentPrice)}</span><span>KES {number(row.productValue)}</span><span>{row.isFragile ? "Yes" : "No"}</span><span>{row.isPerishable ? "Yes" : "No"}</span><span>{Number(row.statusID) === 1 ? "Active" : "Inactive"}</span><span>{row.dateAdded ? new Date(row.dateAdded).toLocaleDateString("en-KE") : "—"}</span></div>) : <div className={styles.empty}>No product data available</div>}</div>;
}

export default function StockTakePage() {
  const { shipmentOrderAnalytics, orderLoading, orderError, fetchShipmentOrderAnalytics } = useAnalytics();
  const { filters } = useGlobalFilters();
  const { vendorProducts, loading: productLoading, error: productError, fetchVendorProducts } = useVendorProducts();
  const [showAll, setShowAll] = useState(false);
  const [view, setView] = useState("dc");

  useEffect(() => {
    fetchShipmentOrderAnalytics({ startDate: `${filters.startDate}T00:00:00`, endDate: `${filters.endDate}T23:59:59`, vendorCode: filters.vendorCode || undefined, originDCCode: filters.dcCode || undefined, destinationDCCode: filters.dcCode || undefined }).catch(() => {});
  }, [fetchShipmentOrderAnalytics, filters.startDate, filters.endDate, filters.vendorCode, filters.dcCode]);

  useEffect(() => {
    fetchVendorProducts({ pageNo: 1, pageSize: 500, vendorCode: filters.vendorCode || undefined });
  }, [fetchVendorProducts, filters.vendorCode]);

  const destinations = readAnalyticsArray(shipmentOrderAnalytics, "DestinationDCAnalytics");
  const origins = readAnalyticsArray(shipmentOrderAnalytics, "OriginDCAnalytics");
  const rows = useMemo(() => destinations.map((destination) => {
    const dcCode = firstValue(destination, ["DestinationDCCode", "DCCode"], "UNASSIGNED");
    const origin = origins.find((item) => String(firstValue(item, ["OriginDCCode", "DCCode"], "")) === String(dcCode)) || {};
    const opening = Number(firstValue(destination, ["Opening", "OpeningCount", "OpeningOrders", "TotalOrders"], 0));
    const received = Number(firstValue(destination, ["Received", "ReceivedCount", "ReceivedAtDCOrders"], 0));
    const delivered = Number(firstValue(destination, ["Delivered", "DeliveredCount", "DeliveredOrders"], 0));
    const firstAttempt = Number(firstValue(destination, ["FirstAttempt", "FirstAttemptCount", "FirstAttemptOrders", "DeliveryAttemptedOrders"], 0));
    const secondAttempt = Number(firstValue(destination, ["SecondAttempt", "SecondAttemptCount", "SecondAttemptOrders"], 0));
    const cancelled = Number(firstValue(destination, ["CancelledReversed", "CancelledReversedCount", "CancelledOrders", "ReversedOrders"], 0));
    const returnEnroute = Number(firstValue(destination, ["ReturnEnroute", "ReturnEnrouteCount", "ReturnInTransitOrders"], firstValue(origin, ["ReturnOrders"], 0)));
    const expected = Number(firstValue(destination, ["Expected", "ExpectedCount", "ExpectedOrders", "TotalOrders"], 0));
    const dailyStock = Number(firstValue(destination, ["DailyStockCount", "DailyStock", "StockCount"], Math.max(opening + received - delivered - cancelled - returnEnroute, 0)));
    const status = firstValue(destination, ["Status", "StockStatus"], dailyStock === expected ? "BALANCED" : `${Math.abs(expected - dailyStock)} X`);
    return { dcCode, opening, received, delivered, firstAttempt, secondAttempt, cancelled, returnEnroute, expected, dailyStock, status };
  }), [destinations, origins]);

  const activeRows = view === "dc" ? rows : vendorProducts;
  const loading = view === "dc" ? orderLoading : productLoading;
  const error = view === "dc" ? orderError : productError;

  return <main className={styles.page}><section className={styles.panel}><header><div><small>OPERATIONS</small><h1>Inventory</h1><p>Review inventory by distribution centre or product.</p></div><div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",justifyContent:"flex-end"}}><div style={{display:"flex",padding:3,border:"1px solid #eaecf0",borderRadius:7,background:"#f2f4f7"}}><button style={view === "dc" ? {background:"#fff",color:"#ff6200",boxShadow:"0 1px 3px #10182818"} : {background:"transparent",borderColor:"transparent",color:"#667085"}} onClick={() => { setView("dc"); setShowAll(false); }}>DC View</button><button style={view === "product" ? {background:"#fff",color:"#ff6200",boxShadow:"0 1px 3px #10182818"} : {background:"transparent",borderColor:"transparent",color:"#667085"}} onClick={() => { setView("product"); setShowAll(false); }}>Product View</button></div>{activeRows.length > 0 && <button onClick={() => setShowAll(true)}>View all ({number(activeRows.length)})</button>}</div></header>{loading ? <div className={styles.message}>Loading inventory data...</div> : error ? <div className={styles.error}>{error}</div> : view === "dc" ? <StockTable rows={rows.slice(0, 10)} /> : <ProductTable rows={vendorProducts.slice(0, 10)} />}</section><div className={`${styles.backdrop} ${!showAll ? styles.hidden : ""}`} onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAll(false); }}><section className={styles.modal} role="dialog" aria-modal={showAll}><header><div><small>INVENTORY</small><h2>All {view === "dc" ? "distribution centres" : "products"}</h2></div><button onClick={() => setShowAll(false)} aria-label="Close inventory dialog"><X /></button></header><div className={styles.modalBody}>{view === "dc" ? <StockTable rows={rows} /> : <ProductTable rows={vendorProducts} />}</div></section></div></main>;
}
