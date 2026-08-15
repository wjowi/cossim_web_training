"use client";
import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "feather-icons-react";
import React, { useState, useEffect, useMemo } from "react";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { Badge, Button, Card } from "react-bootstrap";
import Select from "react-select";
import notify from "@/lib/toast";
import Link from "@/components/Link";
import { all_routes } from "@/Router/all_routes";
import { postShipmentHandoverBatch } from "@/services/shipmentService";
import { useAdmin } from "@/hooks/useAdmin";
import { useRouter } from "next/navigation";
import BatchScanStep from "@/components/batches/BatchScanStep";

const STEPS = [
  { num: 1, label: "Configure Batch" },
  { num: 2, label: "Scan Orders" },
  { num: 3, label: "Review & Confirm" },
];

const CreateHandoverBatch = () => {
  const router = useRouter();
  const MySwal = withReactContent(Swal);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fromDCCode: null,
    toDCCode: null,
    courierCode: null,
    notes: "",
  });
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    distributionCenters,
    fetchDistributionCenters,
    couriers,
    fetchCouriers,
  } = useAdmin();

  useEffect(() => {
    fetchDistributionCenters();
    fetchCouriers();
  }, [fetchDistributionCenters, fetchCouriers]);

  const handleStep1Next = () => {
    if (!form.fromDCCode || !form.toDCCode || !form.courierCode) {
      notify.error("Please fill in all required fields");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (selectedOrders.length === 0 || !form.fromDCCode || !form.toDCCode || !form.courierCode) {
      notify.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const batchData = {
        fromDCCode: form.fromDCCode.value,
        toDCCode: form.toDCCode.value,
        courierCode: form.courierCode.value,
        riderUserCode: "", // Assuming no rider for handover batch
        notes: form.notes,
        shipmentOrderArray: selectedOrders.map((o) => ({ orderNO: o.OrderNO })),
      };

      const response = await postShipmentHandoverBatch(batchData);

      if (response.Error) {
        notify.error(response.Message || "Failed to create handover batch");
      } else {
        MySwal.fire({
          title: "Success!",
          text: "Handover batch created successfully!",
          icon: "success",
          confirmButtonText: "View Batches",
          showCancelButton: true,
          cancelButtonText: "Create Another",
        }).then((result) => {
          if (result.isConfirmed) {
            router.push(all_routes.batches);
          } else {
            setStep(1);
            setForm({ fromDCCode: null, toDCCode: null, courierCode: null, notes: "" });
            setSelectedOrders([]);
          }
        });
      }
    } catch (error) {
      notify.error(error.message || "Failed to create handover batch");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Step 1 helpers ---

  const dcOptions = distributionCenters
    .filter((dc) => dc.IsPrimary)
    .map((dc) => ({
      value: dc.DCCode,
      label: `${dc.DCCode} - ${dc.DCName} (${dc.CityName})`,
    }));

  const toDcOptions = distributionCenters.map((dc) => ({
    value: dc.DCCode,
    label: `${dc.DCCode} - ${dc.DCName} (${dc.CityName})`,
  }));

  const handleSelectChange = (selectedOption, actionMeta) => {
    setForm((prev) => ({ ...prev, [actionMeta.name]: selectedOption }));
  };

  const courierOptions = useMemo(() => {
    if (!Array.isArray(couriers)) return [];
    return couriers
      .filter((c) => c.IsActive && !c.IsDeleted)
      .map((c) => ({
        value: c.CourierCode,
        label: `${c.CourierName} - ${c.CourierCode}`,
      }));
  }, [couriers]);

  const selectStyles = {
    control: (base) => ({ ...base, backgroundColor: "#F5E6D8" }),
  };

  return (
    <div className="content">
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <Link href={all_routes.batches} className="btn btn-outline-primary me-3">
              <ArrowLeft size={16} className="me-2" />
              Back to Batches
            </Link>
            <div>
              <h4>Create Handover Batch</h4>
              <h6>Configure batch details, scan orders, and review before creating</h6>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <Card>
            <Card.Body>
              {/* ── Progress Stepper ── */}
              <div className="d-flex align-items-center justify-content-center mb-5">
                {STEPS.map((s, idx) => (
                  <React.Fragment key={s.num}>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold ${
                          step >= s.num ? "bg-primary text-white" : "bg-light text-muted"
                        }`}
                        style={{ width: 36, height: 36, fontSize: 14 }}
                      >
                        {step > s.num ? <CheckCircle size={16} /> : s.num}
                      </div>
                      <span
                        className={`fw-semibold ${step >= s.num ? "text-primary" : "text-muted"}`}
                        style={{ whiteSpace: "nowrap", fontSize: 14 }}
                      >
                        {s.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={`mx-3 flex-shrink-0 ${step > s.num ? "bg-primary" : "bg-light"}`}
                        style={{ height: 2, width: 64 }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* ══ Step 1: Configure Batch ══ */}
              {step === 1 && (
                <div>
                  <h5 className="mb-4">Configure Batch Details</h5>

                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-bold">From Distribution Center *</label>
                      <Select
                        name="fromDCCode"
                        value={form.fromDCCode}
                        onChange={handleSelectChange}
                        options={dcOptions}
                        placeholder="Select Source DC"
                        isClearable
                        isSearchable
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={selectStyles}
                      />
                    </div>

                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-bold">To Distribution Center *</label>
                      <Select
                        name="toDCCode"
                        value={form.toDCCode}
                        onChange={handleSelectChange}
                        options={toDcOptions}
                        placeholder="Select Destination DC"
                        isClearable
                        isSearchable
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={selectStyles}
                      />
                    </div>

                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-bold">Courier *</label>
                      <Select
                        name="courierCode"
                        value={form.courierCode}
                        onChange={handleSelectChange}
                        options={courierOptions}
                        placeholder="Select Courier"
                        isClearable
                        isSearchable
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={selectStyles}
                      />
                    </div>

                    <div className="col-12 mb-4">
                      <label className="form-label fw-bold">Notes</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        value={form.notes}
                        onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                        placeholder="Optional notes for the handover batch"
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleStep1Next}
                      disabled={!form.fromDCCode || !form.toDCCode || !form.courierCode}
                      className="d-flex align-items-center gap-2"
                    >
                      Next: Scan Orders
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                </div>
              )}

              {/* ══ Step 2: Scan Orders — delegated to shared component ══ */}
              {step === 2 && (
                <BatchScanStep
                  form={form}
                  initialOrders={selectedOrders}
                  onNext={(orders) => {
                    setSelectedOrders(orders);
                    setStep(3);
                  }}
                  onBack={() => setStep(1)}
                />
              )}

              {/* ══ Step 3: Review & Confirm ══ */}
              {step === 3 && (
                <div>
                  <h5 className="mb-4">Review Batch Details</h5>

                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <div className="border rounded p-3">
                        <h6 className="mb-3">Batch Configuration</h6>
                        <div className="mb-2">
                          <strong>From DC:</strong> {form.fromDCCode?.label || "Not selected"}
                        </div>
                        <div className="mb-2">
                          <strong>To DC:</strong> {form.toDCCode?.label || "Not selected"}
                        </div>
                        <div className="mb-2">
                          <strong>Courier:</strong> {form.courierCode?.label || "Not selected"}
                        </div>
                        {form.notes && (
                          <div className="mb-2">
                            <strong>Notes:</strong> {form.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6 mb-4">
                      <div className="border rounded p-3">
                        <h6 className="mb-3">Order Summary</h6>
                        <div className="mb-2">
                          <strong>Total Orders:</strong> {selectedOrders.length}
                        </div>
                        <div className="mb-2">
                          <strong>Order Numbers:</strong>
                          <div className="mt-2" style={{ maxHeight: 100, overflowY: "auto" }}>
                            {selectedOrders.map((order) => (
                              <Badge key={order.OrderNO} bg="secondary" className="me-1 mb-1">
                                {order.OrderNO}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="mb-3">Selected Orders Details:</h6>
                    <div className="border rounded p-3" style={{ maxHeight: 300, overflowY: "auto" }}>
                      {selectedOrders.map((order) => (
                        <div
                          key={order.OrderNO}
                          className="d-flex justify-content-between align-items-center mb-3 p-2 rounded"
                        >
                          <div>
                            <strong>{order.OrderNO}</strong>
                            <br />
                            <small className="text-muted">
                              Vendor: {order.VendorName || "N/A"} | Type:{" "}
                              {order.DeliveryTypeName || "N/A"} | Created:{" "}
                              {order.CreatedDate
                                ? new Date(order.CreatedDate).toLocaleDateString()
                                : "N/A"}
                            </small>
                          </div>
                          <Badge bg={order.StatusID === 1 ? "success" : "warning"}>
                            {order.StatusName || "Unknown"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="d-flex justify-content-between">
                    <Button
                      variant="outline-secondary"
                      size="lg"
                      onClick={() => setStep(2)}
                      className="d-flex align-items-center gap-2"
                    >
                      <ChevronLeft size={18} />
                      Back to Scan Orders
                    </Button>
                    <Button
                      variant="success"
                      size="lg"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="d-flex align-items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="progressbar" />
                          Creating Batch…
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Create Handover Batch
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateHandoverBatch;
