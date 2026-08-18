"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, CheckCircle2, Clock3, PackageCheck, RotateCcw, Search, Ship, Truck, X } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import Link from "@/components/Link";
import { readAnalyticsArray, readAnalyticsValue } from "@/utils/analyticsReportUtils";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import styles from "./dashboard.module.scss";

const fallbackStatuses = [["Delivered",120,59.4],["In Transit",34,16.8],["Processing",28,13.9],["Returned",20,9.9]].map(([StatusName,OrderCount,PercentageOfOrders])=>({StatusName,OrderCount,PercentageOfOrders}));
const fallbackAging = [["0–1 day",84],["2–3 days",61],["4–7 days",39],["8–14 days",13],["15+ days",5]].map(([AgingBucket,OrderCount])=>({AgingBucket,OrderCount}));
const orderStatusStages = [
  { StatusName: "Order Confirmed", PhaseCode: "VENDOR", aliases: ["ORDER CONFIRMED", "CONFIRMED BY VENDOR", "VENDOR CREATED"] },
  { StatusName: "HQ Hub", PhaseCode: "HQ HUB", aliases: ["HQ HUB", "PICKED BY COURIER", "ORDER PICKED BY COURIER", "HANDED TO DC CARRIER"] },
  { StatusName: "Received at DC", PhaseCode: "DC", aliases: ["RECEIVED AT DC", "ARRIVED AT DC", "RECEIVED INTO DC"] },
  { StatusName: "1st Attempt", PhaseCode: "DELIVERY", aliases: ["1ST ATTEMPT", "FIRST ATTEMPT", "DELIVERY ATTEMPTED"] },
  { StatusName: "2nd Attempt", PhaseCode: "DELIVERY", aliases: ["2ND ATTEMPT", "SECOND ATTEMPT"] },
  { StatusName: "3rd Attempt", PhaseCode: "DELIVERY", aliases: ["3RD ATTEMPT", "THIRD ATTEMPT"] },
  { StatusName: "Return Leg", PhaseCode: "RETURN", aliases: ["RETURN LEG", "RETURN IN TRANSIT", "RETURNED TO VENDOR", "RETURN REQUESTED"] },
  { StatusName: "Completed", PhaseCode: "CLOSED", aliases: ["COMPLETED", "DELIVERED", "CLOSED SUCCESS", "ACCEPTED", "PICKED UP BY CUSTOMER"] },
];
const number = value => Number(value||0).toLocaleString("en-KE");
const normalizeStatus = value => String(value||"").replaceAll("_"," ").replace(/[()]/g," ").replace(/\s+/g," ").trim().toUpperCase();
const formatBucket = value => String(value||"UNKNOWN").replaceAll("_"," ").replaceAll("–"," TO ").replaceAll("-"," TO ").replace(/\s+/g," ").trim().toUpperCase();

function Metric({label,value,helper,Icon}) { return <article className={styles.metric}><span><Icon size={19}/></span><div><small>{label}</small><strong>{value}</strong>{helper&&<em>{helper}</em>}</div></article>; }

export default function DashboardPage(){
  const {shipmentOrderAnalytics,orderLoading,orderError,fetchShipmentOrderAnalytics}=useAnalytics();
  const {filters}=useGlobalFilters();
  const [query,setQuery]=useState("");
  const [selectedTask,setSelectedTask]=useState(null);
  useEffect(()=>{fetchShipmentOrderAnalytics({startDate:`${filters.startDate}T00:00:00`,endDate:`${filters.endDate}T23:59:59`,vendorCode:filters.vendorCode||undefined,originDCCode:filters.dcCode||undefined,destinationDCCode:filters.dcCode||undefined}).catch(()=>{});},[fetchShipmentOrderAnalytics,filters.startDate,filters.endDate,filters.vendorCode,filters.dcCode]);
  const summary=readAnalyticsValue(shipmentOrderAnalytics,"Summary",{});
  const statuses=readAnalyticsArray(shipmentOrderAnalytics,"StatusAnalytics");
  const risks=readAnalyticsArray(shipmentOrderAnalytics,"CurrentSLARisk");
  const statusRows=shipmentOrderAnalytics?statuses:fallbackStatuses;
  const total=Number(readAnalyticsValue(summary,"TotalOrders",statusRows.reduce((sum,row)=>sum+Number(readAnalyticsValue(row,"OrderCount",0)),0)));
  const orderedStatusRows=useMemo(()=>orderStatusStages.map(stage=>{
    const count=statusRows.reduce((sum,row)=>{
      const name=normalizeStatus(readAnalyticsValue(row,"StatusName",""));
      return stage.aliases.some(alias=>name.includes(alias))?sum+Number(readAnalyticsValue(row,"OrderCount",0)):sum;
    },0);
    return {...stage,OrderCount:count,PercentageOfOrders:total?count/total*100:0};
  }),[statusRows,total]);
  const tasks=useMemo(()=>{
    const groups={dispatch:[],receive:[],return:[]};
    risks.forEach(row=>{const name=String(readAnalyticsValue(row,"StatusName","")).toLowerCase();if(name.includes("return")||name.includes("failed"))groups.return.push(row);else if(name.includes("transit")||name.includes("receive")||name.includes("arriv"))groups.receive.push(row);else groups.dispatch.push(row)});
    return groups;
  },[risks]);
  const orderSummaryCards=[
    ["Received from vendor",number(readAnalyticsValue(summary,"TotalOrders",202)),"Selected period",Box],
    ["In transit",number(readAnalyticsValue(summary,"ActiveOrders",62)),"Currently in progress",Clock3],
    ["Delivered",number(readAnalyticsValue(summary,"DeliveredOrders",120)),`${Number(readAnalyticsValue(summary,"DeliveryRatePercentage",59.4)).toFixed(1)}% delivery rate`,CheckCircle2],
    ["Failed / returned",number(readAnalyticsValue(summary,"FailedOrders",20)),`${Number(readAnalyticsValue(summary,"FailureRatePercentage",9.9)).toFixed(1)}% failure rate`,RotateCcw],
  ];
  const financialSummaryCards=[
    ["Shipment fees",`KES ${number(readAnalyticsValue(summary,"TotalShipmentFees",104185))}`,"Gross fees",PackageCheck],
    ["COD exposure",`KES ${number(readAnalyticsValue(summary,"CashOnDeliveryAmount",59337))}`,`${number(readAnalyticsValue(summary,"CashOnDeliveryOrders",0))} COD orders`,Box],
    ["Average order value",`KES ${number(total?Number(readAnalyticsValue(summary,"TotalShipmentFees",104185))/total:0)}`,"Per shipment",Ship],
    ["SLA compliance",`${Number(readAnalyticsValue(readAnalyticsValue(shipmentOrderAnalytics,"SLASummary",{}),"SLACompliancePercentage",88)).toFixed(1)}%`,"Measured events",CheckCircle2],
  ];
  const taskGroups=[
    ["Orders to dispatch","dispatch",Truck,"Ready for rider assignment"],
    ["Orders to receive","receive",PackageCheck,"Arriving at distribution center"],
    ["Orders to return","return",RotateCcw,"Requires return action"],
  ];
  return <main className={styles.page}><div className={styles.dashboard}>
    <div className={styles.operationalGrid}>
      <section className={styles.workspace}>
        <section className={styles.summaryPanel}><div className={styles.panelHeader}><div><small>PERFORMANCE SNAPSHOT</small><h2>Order summary</h2></div></div><div className={styles.metricGrid}>{orderSummaryCards.map(([label,value,helper,Icon])=><Metric key={label} label={label} value={value} helper={helper} Icon={Icon}/>)}</div></section>
        <section className={styles.summaryPanel}><div className={styles.panelHeader}><div><small>FINANCIAL PERFORMANCE</small><h2>Financial summary</h2></div></div><div className={styles.metricGrid}>{financialSummaryCards.map(([label,value,helper,Icon])=><Metric key={label} label={label} value={value} helper={helper} Icon={Icon}/>)}</div></section>
      </section>
      <aside className={styles.actionPanel}><div className={styles.panelHeader}><div><small>OPERATIONS DESK</small><h1>Shipment actions</h1></div>{orderLoading&&<span className={styles.loading}>Updating…</span>}</div><div className={styles.actionContent}><div className={styles.searchTab}><div className={styles.actionSectionTitle}><Search size={15}/><strong>Search shipment</strong></div><label>Tracking number</label><div className={styles.shipmentSearchForm}><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="e.g. COS-10482"/><Link className={styles.searchButton} to={query?`/admin/packages?searchTerm=${encodeURIComponent(query)}`:"/admin/packages"}>Search</Link></div><div className={styles.searchHint}><Search size={30}/><h3>Find a shipment</h3><p>Enter a shipment number to open its latest status, route and available actions.</p></div></div><div><div className={styles.actionSectionTitle}><PackageCheck size={15}/><strong>Current tasks</strong></div><div className={styles.taskList}>{taskGroups.map(([label,key,Icon,helper])=><button key={key} onClick={()=>setSelectedTask({label,key,rows:tasks[key]})}><span><Icon size={20}/></span><div><strong>{label}</strong><small>{helper}</small></div><b>{tasks[key].length}</b></button>)}{orderError&&<p className={styles.error}>{orderError}</p>}</div></div></div>
      </aside>
      <section className={styles.statusPanel}><div className={styles.sectionHeading}><div><small>LIVE OVERVIEW</small><h2>ORDER STATUS</h2></div><span>{number(total)} ORDERS</span></div><div className={styles.statusGrid}>{orderedStatusRows.map((row,index)=>{const count=Number(row.OrderCount);const percent=Number(row.PercentageOfOrders);return <div className={styles.statusItem} key={row.StatusName}><span className={styles.stepNumber}>{index+1}</span><div><span><strong>{row.StatusName.toUpperCase()}</strong><small>{row.PhaseCode}</small></span><b>{number(count)}</b></div><div className={styles.statusProgress}><i style={{width:`${Math.min(percent,100)}%`}}/></div><small>{percent.toFixed(1)}% ACHIEVED</small></div>})}</div></section>
    </div>
    <div className={`${styles.modalBackdrop} ${!selectedTask?styles.hidden:""}`} onMouseDown={event=>{if(event.target===event.currentTarget)setSelectedTask(null)}} aria-hidden={!selectedTask}><section className={styles.modal} role="dialog" aria-modal={Boolean(selectedTask)}><header><div><small>CURRENT TASKS</small><h2>{selectedTask?.label||"ORDER TASKS"}</h2></div><button onClick={()=>setSelectedTask(null)} aria-label="Close task dialog"><X/></button></header><div className={styles.modalBody}>{selectedTask?.rows?.length?selectedTask.rows.map((row,index)=>{const order=readAnalyticsValue(row,"OrderNO",`Order ${index+1}`);return <div className={styles.taskRow} key={`${order}-${index}`}><div><strong>{order}</strong><small>{readAnalyticsValue(row,"StatusName","Awaiting action")}</small></div><span>{Number(readAnalyticsValue(row,"SLAPercentageUsed",0)).toFixed(0)}% SLA used</span><Link to={`/admin/packages?searchTerm=${encodeURIComponent(order)}`}>Open order</Link></div>}):<div className={styles.emptyState}><CheckCircle2/><h3>All caught up</h3><p>There are no orders in this task group.</p></div>}</div></section></div>
  </div></main>;
}
