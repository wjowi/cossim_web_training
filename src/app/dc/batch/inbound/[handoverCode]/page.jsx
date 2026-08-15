"use client";
import { ArrowLeft, RotateCcw, Eye, Package, CheckCircle, ArrowDown } from "feather-icons-react";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Datatable from "@/core/pagination/datatable";
import { useShipment } from "@/hooks/useShipment";
import DCSwitcher from "@/components/DCSwitcher";
import { ReceiveInboundBatchModal } from "@/components/modals";
import { Alert, Badge, Button, Card, Spinner } from "react-bootstrap";
import notify from "@/lib/toast";

const HANDOVER_STATUS_CLOSED = 2;

const InboundBatchDetail = () => {
  const params = useParams();
  const router = useRouter();
  const handoverCode = params.handoverCode;

  // Use shipment hook
  const {
    handoverItems,
    fetchHandoverItems,
    fetchHandoverBatchList,
    loading,
    error,
    clearHandoverData,
    dcCode,
    handleReceiveInboundShipmentBatch,
  } = useShipment();

  // Local state
  const [batchInfo, setBatchInfo] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  // Fetch handover items and batch status for this batch
  const fetchBatchItems = async () => {
    if (!handoverCode || !dcCode) {
      console.warn("Handover code or DC code not available");
      return;
    }

    try {
      const [itemsResponse, batchListResponse] = await Promise.all([
        fetchHandoverItems({
          handoverCode: handoverCode,
          ToDCCode: dcCode, // For inbound, we're the destination DC
        }),
        fetchHandoverBatchList({ handoverCode, pageNo: 1, pageSize: 1 }),
      ]);

      const items = itemsResponse?.Data || [];
      const batchRecord = batchListResponse?.Data?.[0] || null;

      if (items.length > 0 || batchRecord) {
        setBatchInfo({
          handoverCode: items[0]?.HandoverCode || batchRecord?.HandoverCode || handoverCode,
          fromDC: items[0]?.FromDCCode || batchRecord?.FromDCCode,
          toDC: items[0]?.ToDCCode || batchRecord?.ToDCCode,
          rider: items[0]?.RiderUserCode || batchRecord?.RiderUserCode,
          createdDate: items[0]?.CreatedDate || batchRecord?.DateAdded,
          totalItems: items.length || batchRecord?.TotalItems || 0,
          statusID: batchRecord?.StatusID,
          closedAt: batchRecord?.ClosedAt,
          confirmedBy: batchRecord?.ConfirmedBy,
        });
      }
    } catch (error) {
      console.error("Error fetching batch items:", error);
      notify.error(error.message || "Failed to fetch batch items");
    }
  };

  useEffect(() => {
    if (handoverCode && dcCode) {
      fetchBatchItems();
    }
  }, [handoverCode, dcCode]);

  const isClosed = batchInfo?.statusID === HANDOVER_STATUS_CLOSED;

  // Handle refresh
  const handleRefresh = () => {
    clearHandoverData();
    fetchBatchItems();
  };

  // Handle back navigation
  const handleBack = () => {
    router.push("/dc/batch/inbound");
  };

  // Handle row selection change
  const handleRowSelectionChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // Open the receive modal for the currently selected rows
  const handleOpenReceiveModal = () => {
    if (selectedRowKeys.length === 0) {
      notify.error("Please select items to receive");
      return;
    }
    setShowReceiveModal(true);
  };

  // Open the receive modal for every item in the batch
  const handleReceiveAll = () => {
    if (!handoverItems || handoverItems.length === 0) {
      notify.error("This batch has no items to receive");
      return;
    }
    setSelectedRowKeys(handoverItems.map((item) => item.OrderNO));
    setShowReceiveModal(true);
  };

  // Submit the batch receive request (ReceiveInboundShipmentBatch) and show a results summary
  const handleReceiveSubmit = async (payload) => {
    const response = await handleReceiveInboundShipmentBatch(payload);

    const summaryText =
      [response?.Message, response?.HandoverMessage].filter(Boolean).join(" ") ||
      (response?.Error ? "Batch Received With Issues" : "Batch Received");

    if (response?.Error) {
      notify.error(summaryText);
    } else {
      notify.success(summaryText);
    }

    setSelectedRowKeys([]);
    handleRefresh();
  };

  // Table columns for handover items
  const columns = [
    {
      title: "Order No",
      dataIndex: "OrderNO",
      key: "OrderNO",
      width: 160,
      render: (text) => <span className="fw-bold">{text}</span>,
    },
    {
      title: "Customer Name",
      dataIndex: "CustomerName",
      key: "CustomerName",
      render: (text) => text || "N/A",
    },
    {
      title: "Customer Phone",
      dataIndex: "CustomerPhone",
      key: "CustomerPhone",
      render: (text) => text || "N/A",
    },
    {
      title: "Vendor",
      dataIndex: "VendorName",
      key: "VendorName",
      render: (text) => text || "N/A",
    },
    {
      title: "Origin DC",
      dataIndex: "OriginDCCode",
      key: "OriginDCCode",
      width: 100,
      render: (text) => <span className="badge bg-info">{text}</span>,
    },
    {
      title: "Destination DC",
      dataIndex: "DestinationDCCode",
      key: "DestinationDCCode",
      width: 130,
      render: (text) => <span className="badge bg-success">{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "StatusName",
      key: "StatusName",
      width: 120,
      render: (text) => {
        const statusColors = {
          "Pending": "warning",
          "Accepted": "success",
          "Rejected": "danger",
          "In Transit": "info",
        };
        return (
          <span className={`badge bg-${statusColors[text] || "secondary"}`}>
            {text || "Unknown"}
          </span>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (record) => (
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => {
            router.push(`/dc/shipment/${record.OrderNO}`);
          }}
        >
          <Eye size={14} className="me-1" />
          View
        </button>
      ),
    },
  ];

  if (loading && !batchInfo) {
    return (
      <div className="content">
        <div className="text-center p-5">
          <Spinner animation="border" />
          <p className="mt-2">Loading batch details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Batch</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={handleRefresh}>
            Try Again
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="content">
      {/* Header */}
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <div className="d-flex align-items-center">
              <Button
                variant="outline-secondary"
                size="sm"
                className="me-3"
                onClick={handleBack}
              >
                <ArrowLeft size={16} />
              </Button>
              <ArrowDown size={20} className="me-2 text-success" />
              <div>
                <h4>Inbound Batch: {handoverCode}</h4>
                <h6>View and receive items in this inbound batch</h6>
              </div>
            </div>
          </div>
        </div>
        <DCSwitcher />
        <div className="page-btn">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="me-2"
          >
            <RotateCcw size={14} className="me-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Batch Info Card */}
      {batchInfo && (
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Batch Information</h5>
            <Badge bg={isClosed ? "secondary" : "warning"}>
              {isClosed ? "Closed" : "Open"}
            </Badge>
          </Card.Header>
          <Card.Body>
            <div className="row">
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label fw-bold">Handover Code:</label>
                  <p className="mb-0">{batchInfo.handoverCode}</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label fw-bold">From DC:</label>
                  <p className="mb-0">
                    <Badge bg="info">{batchInfo.fromDC}</Badge>
                  </p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label fw-bold">To DC:</label>
                  <p className="mb-0">
                    <Badge bg="success">{batchInfo.toDC}</Badge>
                  </p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label fw-bold">Rider:</label>
                  <p className="mb-0">{batchInfo.rider || "N/A"}</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label fw-bold">Total Items:</label>
                  <p className="mb-0">{batchInfo.totalItems}</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label fw-bold">Created Date:</label>
                  <p className="mb-0">
                    {batchInfo.createdDate
                      ? new Date(batchInfo.createdDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
              {isClosed && (
                <div className="col-md-3">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Closed By:</label>
                    <p className="mb-0">
                      {batchInfo.confirmedBy || "N/A"}
                      {batchInfo.closedAt
                        ? ` on ${new Date(batchInfo.closedAt).toLocaleString()}`
                        : ""}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Items Table */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Batch Items</h5>
          {!isClosed && handoverItems && handoverItems.length > 0 && (
            <div>
              <Button
                variant="outline-success"
                size="sm"
                className="me-2"
                onClick={handleReceiveAll}
              >
                <CheckCircle size={14} className="me-1" />
                Receive All
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={handleOpenReceiveModal}
                disabled={selectedRowKeys.length === 0}
              >
                <CheckCircle size={14} className="me-1" />
                Receive Selected ({selectedRowKeys.length})
              </Button>
            </div>
          )}
        </Card.Header>
        <Card.Body>
          {isClosed && (
            <div className="alert alert-secondary">
              This handover batch has already been closed. Items shown below reflect
              their status at the time of receipt.
            </div>
          )}
          {loading ? (
            <div className="text-center p-3">
              <Spinner animation="border" />
              <p className="mt-2">Loading items...</p>
            </div>
          ) : handoverItems && handoverItems.length > 0 ? (
            <Datatable
              columns={columns}
              dataSource={handoverItems}
              loading={loading}
              rowKey="OrderNO"
              rowSelection={
                isClosed
                  ? false
                  : {
                      selectedRowKeys,
                      onChange: handleRowSelectionChange,
                    }
              }
            />
          ) : (
            <div className="text-center p-4">
              <Package size={48} className="text-muted mb-3" />
              <h5>No items found</h5>
              <p className="text-muted">This batch doesn't contain any items yet.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      <ReceiveInboundBatchModal
        show={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
        onSubmit={handleReceiveSubmit}
        handoverCode={handoverCode}
        dcCode={dcCode}
        orders={(handoverItems || []).filter((item) =>
          selectedRowKeys.includes(item.OrderNO)
        )}
      />
    </div>
  );
};

export default InboundBatchDetail;
