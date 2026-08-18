"use client"
import {
  ChevronUp,
  RotateCcw,
  PlusCircle,
  Send,
  Printer,
  UploadCloud,
  RefreshCw,
} from "feather-icons-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import notify from "@/lib/toast";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Link from "@/components/Link";
import RowActionsDropdown from "@/components/RowActionsDropdown";
import SSRSelect from "@/components/SSRSelect";
import { all_routes } from "@/Router/all_routes";
import Datatable from "@/core/pagination/datatable";
import useShipment from "@/hooks/useShipment";
import useAdmin from "@/hooks/useAdmin";
import { useVendors } from "@/hooks/useVendors";
import useStickerDownload from "@/hooks/useStickerDownload";
import { UpdateStatusModal, BulkUpdateStatusModal, ImportExcelModal } from "@/components/modals";
import { PACKAGE_STATUSES } from "@/constants/package_status";
import TableExportIcons from "@/components/TableExportIcons";
import { createFetchAllDataFunction } from "@/utils/tableExport";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatLocalDateOnly } from "@/lib/utils/dateFormat";
import { exportColumns, pdfColumns } from "./components/tableColumns";

const getStatusName = (status) =>
  status?.statusName ||
  status?.StatusName ||
  status?.name ||
  status?.Name ||
  "";

const getVendorCode = (vendor) =>
  vendor?.vendorCode ||
  vendor?.VendorCode ||
  "";

const getVendorName = (vendor) =>
  vendor?.vendorName ||
  vendor?.VendorName ||
  vendor?.name ||
  vendor?.Name ||
  getVendorCode(vendor);

const getDCCode = (dc) =>
  dc?.DCCode ||
  dc?.dcCode ||
  "";

const getDCName = (dc) =>
  dc?.DCName ||
  dc?.dcName ||
  dc?.name ||
  dc?.Name ||
  getDCCode(dc);

const parsePackageFilterDate = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const getPackageQueryFilters = () => {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    searchTerm: params.get("searchTerm") || "",
    statusName: params.get("statusName") || "",
    vendorCode: params.get("vendorCode") || "",
    fromDCCode: params.get("fromDCCode") || "",
    toDCCode: params.get("toDCCode") || "",
    onlyActive: params.get("onlyActive") === "true",
    startDate: parsePackageFilterDate(params.get("startDate")),
    endDate: parsePackageFilterDate(params.get("endDate")),
  };
};

const PackagesList = () => {
  const route = all_routes;
  const [searchTerm, setSearchTerm] = useState("");
  const [vendorCode, setVendorCode] = useState("");
  const [fromDCCode, setFromDCCode] = useState("");
  const [toDCCode, setToDCCode] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [selectedStatusName, setSelectedStatusName] = useState("");
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [showBulkUpdateStatusModal, setShowBulkUpdateStatusModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const searchTimeoutRef = useRef(null);

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Sticker download hook
  const { showSizeSelectionModal, showBulkSizeSelectionModal, isGenerating } = useStickerDownload();

  const {
    loading,
    error,
    shipmentOrders,
    pagination,
    fetchShipmentOrders,
    clearError,
    updateParams,
    handleUpdateShipmentStatus,
    handleUpdateShipmentStatusBatch
  } = useShipment();
  const {
    orderStatuses,
    fetchShipmentOrderStatus,
  } = useShipment();
  const { vendors } = useVendors({ pageNo: 1, pageSize: 500 });
  const {
    distributionCenters,
    fetchDistributionCenters,
  } = useAdmin();

  const statusOptions = useMemo(
    () =>
      orderStatuses
        .map((status) => {
          const statusName = getStatusName(status);
          return statusName
            ? {
                value: statusName,
                label: statusName,
              }
            : null;
        })
        .filter(Boolean),
    [orderStatuses]
  );

  const vendorOptions = useMemo(
    () =>
      vendors
        .map((vendor) => {
          const code = getVendorCode(vendor);
          return code
            ? {
                value: code,
                label: `${getVendorName(vendor)} (${code})`,
              }
            : null;
        })
        .filter(Boolean),
    [vendors]
  );

  const dcOptions = useMemo(
    () =>
      distributionCenters
        .map((dc) => {
          const code = getDCCode(dc);
          return code
            ? {
                value: code,
                label: `${getDCName(dc)} (${code})`,
              }
            : null;
        })
        .filter(Boolean),
    [distributionCenters]
  );

  const buildShipmentOrderParams = (overrides = {}) => ({
    pageNo: 1,
    pageSize: pagination.pageSize || 100,
    searchTerm: selectedStatusName || searchTerm,
    vendorCode: vendorCode || undefined,
    fromDCCode: fromDCCode || undefined,
    toDCCode: toDCCode || undefined,
    onlyActive,
    startDate: formatLocalDateOnly(startDate),
    endDate: formatLocalDateOnly(endDate),
    ...overrides,
  });

  const loadShipmentOrders = (overrides = {}) => {
    const params = buildShipmentOrderParams(overrides);
    updateParams(params);
    return fetchShipmentOrders(params);
  };

  // Fetch shipment orders on component mount
  useEffect(() => {
    const queryFilters = getPackageQueryFilters();
    const querySearchTerm = queryFilters.statusName || queryFilters.searchTerm || "";

    setSearchTerm(queryFilters.searchTerm || "");
    setSelectedStatusName(queryFilters.statusName || "");
    setVendorCode(queryFilters.vendorCode || "");
    setFromDCCode(queryFilters.fromDCCode || "");
    setToDCCode(queryFilters.toDCCode || "");
    setOnlyActive(Boolean(queryFilters.onlyActive));
    setStartDate(queryFilters.startDate || null);
    setEndDate(queryFilters.endDate || null);

    const initialParams = {
      pageNo: 1,
      pageSize: 100,
      searchTerm: querySearchTerm,
      vendorCode: queryFilters.vendorCode || undefined,
      fromDCCode: queryFilters.fromDCCode || undefined,
      toDCCode: queryFilters.toDCCode || undefined,
      onlyActive: Boolean(queryFilters.onlyActive),
      startDate: formatLocalDateOnly(queryFilters.startDate),
      endDate: formatLocalDateOnly(queryFilters.endDate),
    };
    updateParams(initialParams);
    fetchShipmentOrders(initialParams);
    fetchShipmentOrderStatus();
    fetchDistributionCenters({ pageNo: 1, pageSize: 500 });

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Fetch all data for export, in small batches instead of one huge request,
  // reporting progress back to the export UI as each batch completes.
  const fetchAllDataForExport = async (onProgress) => {
    try {
      const fetchInBatches = createFetchAllDataFunction(
        fetchShipmentOrders,
        buildShipmentOrderParams(),
        { chunkSize: 500 }
      );
      return await fetchInBatches(onProgress);
    } catch (error) {
      console.error('Error fetching all data for export:', error);
      // Fallback to current page data if fetch fails
      return shipmentOrders || [];
    }
  };

  // Handle search functionality
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadShipmentOrders({
        pageNo: 1,
        searchTerm: selectedStatusName || value,
      });
    }, 500);
  };

  // Handle date filter
  const handleDateFilter = () => {
    loadShipmentOrders({ pageNo: 1 });
  };

  // Handle refresh
  const handleRefresh = () => {
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState({}, "", window.location.pathname);
    }
    setSearchTerm("");
    setVendorCode("");
    setFromDCCode("");
    setToDCCode("");
    setOnlyActive(false);
    setSelectedStatusName("");
    setStartDate(null);
    setEndDate(null);
    fetchShipmentOrders({
      pageNo: 1,
      pageSize: 100,
      searchTerm: "",
      startDate: "",
      endDate: "",
      onlyActive: false
    });
  };

  const handleStatusFilterChange = (selected) => {
    const statusName = selected?.value || "";
    setSelectedStatusName(statusName);
    loadShipmentOrders({
      pageNo: 1,
      searchTerm: statusName || searchTerm,
    });
  };

  // Handle update status modal
  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    setShowUpdateStatusModal(true);
  };

  const handleCloseUpdateStatusModal = () => {
    setShowUpdateStatusModal(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatusSubmit = async (payload) => {
    try {
      const response = await handleUpdateShipmentStatus(payload);
      if (response?.Error) {
        throw new Error(response.Message || 'Failed to update status');
      }
      return response;
    } catch (error) {
      // Error is already handled in the hook
      console.error('Failed to update status:', error);
      throw error;
    }
  };

  const handleStatusUpdateSuccess = async (orderNO) => {
    if (!orderNO) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setSearchTerm(orderNO);
    setVendorCode("");
    setFromDCCode("");
    setToDCCode("");
    setOnlyActive(false);
    setSelectedStatusName("");
    setStartDate(null);
    setEndDate(null);

    const params = {
      pageNo: 1,
      pageSize: pagination.pageSize || 100,
      searchTerm: orderNO,
      onlyActive: false,
      startDate: "",
      endDate: "",
    };

    updateParams(params);
    await fetchShipmentOrders(params);
  };

  // Handle bulk update status modal
  const selectedOrders = (shipmentOrders || []).filter(order => selectedRowKeys.includes(order.OrderNO));

  const handleBulkUpdateStatus = () => {
    if (selectedOrders.length === 0) return;
    setShowBulkUpdateStatusModal(true);
  };

  const handleCloseBulkUpdateStatusModal = () => {
    setShowBulkUpdateStatusModal(false);
  };

  const handleBulkUpdateStatusSubmit = async (batchOrders) => {
    try {
      await handleUpdateShipmentStatusBatch(batchOrders);
      setSelectedRowKeys([]);
      // Refresh the list after successful update
      loadShipmentOrders({
        pageNo: pagination.currentPage,
        pageSize: pagination.pageSize,
      });
    } catch (error) {
      // Error is already handled in the hook
      console.error('Failed to update bulk status:', error);
    }
  };

  // Handle download sticker
  const handleDownloadSticker = (record) => {
    showSizeSelectionModal(record);
  };

  // Handle bulk download stickers
  const handleBulkDownloadStickers = () => {
    const selectedPackages = (shipmentOrders || []).filter(order => selectedRowKeys.includes(order.OrderNO));
    if (selectedPackages.length === 0) return;

    showBulkSizeSelectionModal(selectedPackages);
  };

  const MySwal = withReactContent(Swal);

  const getDisplayText = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
  };

  const getTooltipId = (prefix, value) =>
    `${prefix}-${getDisplayText(value).replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 32)}`;

  const TruncatedText = ({ value, className = "" }) => {
    const displayValue = getDisplayText(value);

    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={getTooltipId("packages-tooltip", displayValue)}>{displayValue}</Tooltip>}
      >
        <span className={`packages-table-ellipsis ${className}`.trim()}>
          {displayValue}
        </span>
      </OverlayTrigger>
    );
  };

  // Stops are derived from the shipment's fixed Origin/Destination plus its live tracking
  // location (LatestLogDCName), so an intermediate hub shows up when the package hasn't
  // reached its destination yet.
  const getRouteStops = (record) => {
    const origin = getDisplayText(record.OriginDCName);
    const destination = getDisplayText(record.DestinationDCName);
    const currentLocation = getDisplayText(record.LatestLogDCName);

    const stops = [origin];
    if (
      currentLocation !== "-" &&
      currentLocation !== origin &&
      currentLocation !== destination
    ) {
      stops.push(currentLocation);
    }
    if (destination !== "-") {
      stops.push(destination);
    }

    return stops.filter((stop) => stop && stop !== "-");
  };

  const renderRoute = (record) => {
    const stops = getRouteStops(record);
    const firstStop = stops[0] || "-";
    const lastStop = stops[stops.length - 1] || "-";
    const intermediateCount = Math.max(stops.length - 2, 0);
    const receiverBuilding = record.ReceiverBuilding ? ` (${record.ReceiverBuilding})` : "";
    const routeSummary =
      firstStop === lastStop
        ? firstStop
        : `${firstStop} -> ${lastStop}${receiverBuilding}`;
    const routeDetails = stops.length > 0 ? stops.join(" -> ") : routeSummary;
    const inTransit = intermediateCount > 0 && record.LatestLogDCName;

    return (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={getTooltipId("route-tooltip", record.OrderNO || firstStop)}>
            {routeDetails}{receiverBuilding}
            {record.RouteInfo && <div>{record.RouteInfo}</div>}
            {record.InitialLogDCName && (
              <div>First logged at: {record.InitialLogDCName}</div>
            )}
          </Tooltip>
        }
      >
        <div className="packages-route-cell">
          <Send size={14} className="packages-route-icon" />
          <span className="packages-route-text">
            <span>{firstStop}</span>
            {firstStop !== lastStop && (
              <>
                <span className="packages-route-arrow" aria-hidden="true">&rarr;</span>
                <span>{lastStop}{receiverBuilding}</span>
              </>
            )}
            {inTransit && (
              <small className="text-muted d-block">
                Currently at: {record.LatestLogDCName}
              </small>
            )}
          </span>
          {intermediateCount > 0 && (
            <span className="packages-route-count">+{intermediateCount}</span>
          )}
        </div>
      </OverlayTrigger>
    );
  };

  // Handle delete package
  const handleDeletePackage = async (record) => {
    const { value: notes } = await MySwal.fire({
      title: 'Delete Package',
      text: `Are you sure you want to delete package ${record.OrderNO}?`,
      input: 'textarea',
      inputLabel: 'Notes (optional)',
      inputPlaceholder: 'Enter reason for deletion...',
      inputAttributes: {
        'aria-label': 'Type your notes here'
      },
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#dc3545',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Please enter a reason for deletion';
        }
      }
    });

    if (notes) {
      try {
        await handleUpdateShipmentStatus({
          statusID: 902, // CLOSED_CANCELLED
          orderNO: record.OrderNO,
          notes: notes,
          dcCode: "",
          riderCode: ""
        });

        // Refresh the list after successful deletion
        loadShipmentOrders({
          pageNo: pagination.currentPage,
          pageSize: pagination.pageSize,
        });

        notify.success('Package has been deleted successfully.');
      } catch (error) {
        console.error('Failed to delete package:', error);
        notify.error('Failed to delete package. Please try again.');
      }
    }
  };

  const formatAmount = (value) => {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0);
  };

  const formatPackageDate = (value) => {
    if (!value) return null;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  // Aging = days the order has stayed in the DC since it was added to the system.
  const getAgingDays = (dateAddedValue) => {
    const date = formatPackageDate(dateAddedValue);
    if (!date) return null;

    return Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const formatAgingLabel = (days) => {
    if (days === null) return "-";
    if (days === 0) return "Today";
    return days === 1 ? "1 day" : `${days} days`;
  };

  const columns = [
    {
      title: "Order NO",
      dataIndex: "OrderNO",
      width: 180,
      fixed: "left",
      sorter: (a, b) =>
        getDisplayText(a.OrderNO).localeCompare(getDisplayText(b.OrderNO)),
      render: (text, record) => (
        <div className="packages-person-cell">
          <TruncatedText value={text} className="fw-semibold text-primary" />
          <TruncatedText
            value={record.StatusName || record.StatusCode}
            className="text-muted small"
          />
        </div>
      ),
    },
    {
      title: "Customer",
      dataIndex: "ReceiverContactName",
      width: 190,
      sorter: (a, b) =>
        getDisplayText(a.ReceiverContactName).localeCompare(
          getDisplayText(b.ReceiverContactName)
        ),
      render: (_, record) => (
        <div className="packages-person-cell">
          <TruncatedText
            value={record.ReceiverContactName}
            className="fw-medium"
          />
          <TruncatedText
            value={record.ReceiverContactPhone}
            className="text-muted small"
          />
        </div>
      ),
    },
    {
      title: "COD Amount",
      dataIndex: "CODAmount",
      width: 130,
      align: "right",
      sorter: (a, b) =>
        Number(a.CODAmount || 0) - Number(b.CODAmount || 0),
      render: (value) => (
        <span className="fw-semibold">{formatAmount(value)}</span>
      ),
    },
    {
      title: "Date Added",
      dataIndex: "DateAdded",
      width: 150,
      defaultSortOrder: "descend",
      sorter: (a, b) =>
        (getAgingDays(a.DateAdded) ?? -1) - (getAgingDays(b.DateAdded) ?? -1),
      render: (value) => {
        const date = formatPackageDate(value);
        const aging = getAgingDays(value);

        if (!date) return "-";

        return (
          <div className="packages-date-cell">
            <div>{date.toLocaleDateString("en-GB")}</div>
            <small className={aging >= 7 ? "text-danger fw-semibold" : "text-muted"}>
              {formatAgingLabel(aging)}
            </small>
          </div>
        );
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      width: 110,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <RowActionsDropdown
          id={`dropdown-${record.ShipmentOrderID}`}
          variant="outline-secondary"
          items={[
            {
              key: "view",
              label: "View",
              icon: "feather-eye",
              href: `${route.packages}/${record.OrderNO}`,
            },
            {
              key: "edit",
              label: "Edit",
              icon: "feather-edit",
              href: `${route.packages}/${record.OrderNO}/edit`,
            },
            {
              key: "track",
              label: "Track",
              icon: "feather-map-pin",
              href: `${route.packages}/${record.OrderNO}/track?trackingNumber=${record.OrderNO}`,
            },
            {
              key: "print-sticker",
              label: isGenerating ? "Preparing..." : "Print Sticker",
              icon: "feather-download",
              onClick: () => handleDownloadSticker(record),
              disabled: isGenerating,
            },
            {
              key: "update-status",
              label: "Update Status",
              icon: "feather-refresh-cw",
              onClick: () => handleUpdateStatus(record),
            },
            record.StatusID ===
              PACKAGE_STATUSES.SERVICE_FEE_REQUIRED.orderStatusID && {
              key: "pay-service-fee",
              label: "Pay Service Fee",
              icon: "feather-credit-card",
              href: `/admin/service-fee-payment?orderNO=${record.OrderNO}`,
            },
            {
              key: "delete",
              label: "Delete",
              icon: "feather-trash-2",
              onClick: () => handleDeletePackage(record),
            },
          ].filter(Boolean)}
        />
      ),
    },
  ];

  const renderRefreshTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>
      Refresh
    </Tooltip>
  );
  const renderCollapseTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>
      Collapse
    </Tooltip>
  );

  return (
    <div className="content">
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Packages</h4>
            <h6>Manage your packages</h6>
          </div>
        </div>
        <ul className="table-top-head">
          {/* Export Icons - PDF and Excel */}
          <TableExportIcons
            data={shipmentOrders}
            columns={columns}
            pdfColumns={pdfColumns}
            excelColumns={exportColumns}
            filename="packages-export"
            title="Packages List"
            fetchAllData={fetchAllDataForExport}
            pdfOrientation="landscape"
            onExportSuccess={(format, result) => {
              // Reset pagination to first page after export
              loadShipmentOrders({
                pageNo: 1,
                pageSize: pagination.pageSize,
              });
            }}
          />
          <li>
            <OverlayTrigger placement="top" overlay={renderRefreshTooltip}>
              <Link
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                onClick={handleRefresh}
                style={{ cursor: 'pointer' }}
              >
                <RotateCcw />
              </Link>
            </OverlayTrigger>
          </li>
          <li>
            <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
              <Link
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                id="collapse-header"
              >
                <ChevronUp />
              </Link>
            </OverlayTrigger>
          </li>
        </ul>
        <div className="page-btn d-flex align-items-center">
          <button
            className="btn btn-outline-primary me-2 d-flex align-items-center"
            onClick={() => setShowImportModal(true)}
          >
            <UploadCloud className="me-2 iconsize" />
            Import Excel
          </button>
          <button
            className="btn btn-primary me-2 d-flex align-items-center"
            onClick={handleBulkDownloadStickers}
            disabled={isGenerating || selectedRowKeys.length === 0}
          >
            <Printer className="me-2 iconsize" />
            {isGenerating ? 'Preparing...' : `Print Stickers${selectedRowKeys.length > 0 ? ` (${selectedRowKeys.length})` : ''}`}
          </button>
          <button
            className="btn btn-outline-primary me-2 d-flex align-items-center"
            onClick={handleBulkUpdateStatus}
            disabled={selectedRowKeys.length === 0}
          >
            <RefreshCw className="me-2 iconsize" />
            {`Update Status${selectedRowKeys.length > 0 ? ` (${selectedRowKeys.length})` : ''}`}
          </button>
          <Link to={route.createPackage} className="btn btn-added">
            <PlusCircle className="me-2 iconsize" />
            Add New Package
          </Link>
        </div>

      </div>

      <div className="card table-list-card">
        <div className="card-body">
          <div className="table-top">
            <div className="packages-filter-bar mb-3">
              <div className="packages-filter-field packages-filter-search">
                <input
                  type="text"
                  placeholder="Search by Order NO, Vendor, DC, or Status"
                  className="form-control form-control-sm"
                  value={searchTerm}
                  onChange={handleSearch}
                  aria-label="Search packages"
                />
              </div>
              <div className="packages-filter-field packages-filter-select">
                <SSRSelect
                  instanceId="packages-status-filter"
                  className="packages-filter-select-control"
                  classNamePrefix="packages-filter-select"
                  options={statusOptions}
                  value={statusOptions.find((option) => option.value === selectedStatusName) || null}
                  onChange={handleStatusFilterChange}
                  placeholder="All Statuses"
                  isClearable
                  aria-label="Filter by status"
                />
              </div>
              <div className="packages-filter-field packages-filter-select">
                <SSRSelect
                  instanceId="packages-vendor-filter"
                  className="packages-filter-select-control"
                  classNamePrefix="packages-filter-select"
                  options={vendorOptions}
                  value={vendorOptions.find((option) => option.value === vendorCode) || null}
                  onChange={(selected) => setVendorCode(selected?.value || "")}
                  placeholder="All Vendors"
                  isClearable
                  aria-label="Filter by vendor"
                />
              </div>
              <div className="packages-filter-field packages-filter-compact">
                <SSRSelect
                  instanceId="packages-from-dc-filter"
                  className="packages-filter-select-control"
                  classNamePrefix="packages-filter-select"
                  options={dcOptions}
                  value={dcOptions.find((option) => option.value === fromDCCode) || null}
                  onChange={(selected) => setFromDCCode(selected?.value || "")}
                  placeholder="From DC"
                  isClearable
                  aria-label="Filter by origin DC"
                />
              </div>
              <div className="packages-filter-field packages-filter-compact">
                <SSRSelect
                  instanceId="packages-to-dc-filter"
                  className="packages-filter-select-control"
                  classNamePrefix="packages-filter-select"
                  options={dcOptions}
                  value={dcOptions.find((option) => option.value === toDCCode) || null}
                  onChange={(selected) => setToDCCode(selected?.value || "")}
                  placeholder="To DC"
                  isClearable
                  aria-label="Filter by destination DC"
                />
              </div>
              <label className="packages-filter-active" htmlFor="onlyActivePackages">
                <input
                  className="form-check-input"
                  id="onlyActivePackages"
                  type="checkbox"
                  checked={onlyActive}
                  onChange={(e) => setOnlyActive(e.target.checked)}
                />
                <span>Active only</span>
              </label>
              <div className="packages-filter-field packages-filter-date">
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Start Date"
                  className="form-control form-control-sm"
                  isClearable
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>
              <div className="packages-filter-field packages-filter-date">
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="End Date"
                  className="form-control form-control-sm"
                  isClearable
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>
              <button
                className="btn btn-sm btn-secondary packages-filter-button"
                onClick={handleDateFilter}
              >
                Filter
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading shipment orders...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="alert alert-danger" role="alert">
              <strong>Error:</strong> {error}
              <button
                type="button"
                className="btn-close float-end"
                onClick={clearError}
                aria-label="Close"
              ></button>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <div className="table-responsive packages-table-shell">
              <Datatable
                className="packages-table"
                rowSelection={{
                  selectedRowKeys,
                  onChange: setSelectedRowKeys,
                }}
                columns={columns}
                dataSource={shipmentOrders}
                pagination={{
                  current: pagination.currentPage,
                  total: pagination.totalItems,
                  pageSize: pagination.pageSize,
                  showSizeChanger: true,
                  pageSizeOptions: ['50', '100', '200', '500'],
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} items`,
                  onChange: (page, pageSize) => {
                    loadShipmentOrders({
                      pageNo: page,
                      pageSize,
                    });
                  }
                }}
                rowKey="OrderNO"
                loading={loading}
                tableLayout="fixed"
                sticky={{ offsetHeader: 0 }}
                scroll={{ x: 900, y: 560 }}
                emptyTitle="No shipment orders found"
                emptyDescription="Try a different search, clear your date filters, or create a new package."
                emptyAction={
                  <Link to={route.createPackage} className="btn btn-primary">
                    <PlusCircle className="me-2" size={16} />
                    Create Your First Package
                  </Link>
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      <UpdateStatusModal
        show={showUpdateStatusModal}
        onClose={handleCloseUpdateStatusModal}
        onSubmit={handleUpdateStatusSubmit}
        onSuccess={handleStatusUpdateSuccess}
        order={selectedOrder}
      />

      {/* Bulk Update Status Modal */}
      <BulkUpdateStatusModal
        show={showBulkUpdateStatusModal}
        onClose={handleCloseBulkUpdateStatusModal}
        onSubmit={handleBulkUpdateStatusSubmit}
        orders={selectedOrders}
      />

      {/* Import Excel Modal */}
      <ImportExcelModal
        show={showImportModal}
        showVendorInput={true}
        onClose={() => setShowImportModal(false)}
        onUploadSuccess={() => {
          handleRefresh();
        }}
      />

      <style jsx global>{`
        .packages-filter-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .packages-filter-field {
          flex: 1 1 150px;
          min-width: 0;
        }

        .packages-filter-search {
          flex-basis: 260px;
          flex-grow: 1.4;
        }

        .packages-filter-select {
          flex-basis: 190px;
        }

        .packages-filter-compact,
        .packages-filter-date {
          flex-basis: 140px;
        }

        .packages-filter-field .form-control,
        .packages-filter-field .form-select {
          width: 100%;
          min-height: 36px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .packages-filter-select-control {
          width: 100%;
          font-size: 13px;
        }

        .packages-filter-select__control {
          min-height: 36px !important;
          border-color: #dfe5ef !important;
          border-radius: 6px !important;
          box-shadow: none !important;
        }

        .packages-filter-select__control:hover,
        .packages-filter-select__control--is-focused {
          border-color: #b8c2d4 !important;
        }

        .packages-filter-select__value-container {
          min-width: 0;
          padding: 2px 8px !important;
        }

        .packages-filter-select__single-value,
        .packages-filter-select__placeholder {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .packages-filter-select__indicator {
          padding: 6px !important;
        }

        .packages-filter-select__menu {
          z-index: 20 !important;
        }

        .packages-filter-field .react-datepicker-wrapper,
        .packages-filter-field .react-datepicker__input-container {
          display: block;
          width: 100%;
        }

        .packages-filter-active {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex: 0 0 auto;
          min-height: 36px;
          padding: 6px 12px;
          border: 1px solid #dfe5ef;
          border-radius: 6px;
          color: #344054;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.2;
          background: #fff;
          cursor: pointer;
          white-space: nowrap;
        }

        .packages-filter-active .form-check-input {
          flex: 0 0 auto;
          margin: 0;
        }

        .packages-filter-button {
          flex: 0 0 110px;
          min-height: 36px;
          padding-right: 16px;
          padding-left: 16px;
          white-space: nowrap;
        }

        .packages-table-shell {
          overflow: auto;
          border: 1px solid #edf0f5;
          border-radius: 8px;
        }

        .packages-table .ant-table {
          font-size: 13px;
        }

        .packages-table .ant-table-container table {
          table-layout: fixed !important;
        }

        .packages-table .ant-table-thead > tr > th {
          position: sticky;
          top: 0;
          z-index: 5;
          background: #f8fafc !important;
          color: #344054;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.01em;
          padding: 12px 10px;
          white-space: nowrap;
          border-bottom: 1px solid #e6eaf0;
        }

        .packages-table .ant-table-tbody > tr > td {
          padding: 11px 10px;
          vertical-align: middle;
          color: #344054;
          border-bottom: 1px solid #eef1f5;
        }

        .packages-table .ant-table-tbody > tr:hover > td,
        .packages-table .ant-table-tbody .ant-table-row > .ant-table-cell-row-hover {
          background: #f6f9ff !important;
        }

        .packages-table-ellipsis {
          display: block;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .packages-person-cell {
          min-width: 0;
          line-height: 1.35;
        }

        .packages-person-cell .small,
        .packages-date-cell small,
        .packages-amount-cell small {
          font-size: 11px;
        }

        .packages-route-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          color: #344054;
        }

        .packages-route-icon {
          flex: 0 0 auto;
          color: #0d6efd;
        }

        .packages-route-text {
          display: flex;
          align-items: center;
          min-width: 0;
          overflow: hidden;
          font-weight: 600;
          white-space: nowrap;
        }

        .packages-route-text span:not(.packages-route-arrow) {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .packages-route-arrow {
          flex: 0 0 auto;
          margin: 0 6px;
          color: #98a2b3;
          font-weight: 700;
        }

        .packages-route-count {
          flex: 0 0 auto;
          border-radius: 999px;
          background: #eef4ff;
          color: #175cd3;
          font-size: 11px;
          font-weight: 700;
          padding: 1px 6px;
        }

        .packages-amount-cell,
        .packages-date-cell {
          line-height: 1.35;
          white-space: nowrap;
        }

        .packages-table .dropdown-toggle {
          padding: 4px 8px;
          font-size: 12px;
        }
.packages-route-combined-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.packages-route-point {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  min-width: 0;
  flex: 1 1 0;
}

.packages-route-label {
  flex: 0 0 auto;
  color: #667085;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.4;
  text-transform: uppercase;
}

.packages-route-details {
  min-width: 0;
  line-height: 1.3;
}

.packages-route-arrow {
  flex: 0 0 auto;
  color: #98a2b3;
  font-size: 16px;
  font-weight: 700;
}
        @media (max-width: 1199.98px) {
          .packages-filter-search,
          .packages-filter-select {
            flex-basis: 220px;
          }

          .packages-filter-compact,
          .packages-filter-date {
            flex-basis: 160px;
          }
        }

        @media (max-width: 767.98px) {
          .packages-filter-bar {
            gap: 10px;
          }

          .packages-filter-field,
          .packages-filter-search,
          .packages-filter-select,
          .packages-filter-compact,
          .packages-filter-date,
          .packages-filter-active,
          .packages-filter-button {
            flex: 1 1 100%;
            width: 100%;
          }

          .packages-filter-active {
            justify-content: flex-start;
          }
        }

        @media (max-width: 1199px) {
          .packages-table-shell {
            border-radius: 6px;
          }
        }
      `}</style>
    </div>
  );
};

export default PackagesList;
