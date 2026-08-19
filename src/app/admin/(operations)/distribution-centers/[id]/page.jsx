"use client"
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Row, Col, Badge, Button, Alert } from "react-bootstrap";
import { ArrowLeft, Edit3, Trash2, Users } from "feather-icons-react";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import notify from "@/lib/toast";
import Link from "@/components/Link";
import { Building2 } from "lucide-react";
import {
  getDistributionCenters,
  updateDistributionCenter,
  deactivateDistributionCenter,
} from "@/services/adminService";
import { AddDistributionCenterModal } from "@/components/modals";

const DistributionCenterDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const MySwal = withReactContent(Swal);
  const dcCode = params.id;

  const [dcData, setDcData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadCenter = useCallback(async () => {
    if (!dcCode) return;
    setLoading(true);
    try {
      const response = await getDistributionCenters({ searchTerm: dcCode, pageSize: 50 });
      const match = (response?.Data || []).find((dc) => dc.DCCode === dcCode);
      setDcData(match || null);
    } catch (err) {
      console.error("Error fetching distribution center:", err);
      setDcData(null);
    } finally {
      setLoading(false);
    }
  }, [dcCode]);

  useEffect(() => {
    loadCenter();
  }, [loadCenter]);

  const handleEditCenter = async (data) => {
    try {
      setIsSaving(true);
      const response = await updateDistributionCenter({ ...data, DCCode: dcCode });
      if (response && !response.Error) {
        notify.success("Distribution center updated successfully.");
        setShowEditModal(false);
        loadCenter();
      } else {
        throw new Error(response?.Message || "Failed to update distribution center");
      }
    } catch (err) {
      console.error("Error updating distribution center:", err);
      notify.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDC = async () => {
    const result = await MySwal.fire({
      title: "Deactivate Distribution Center?",
      text: `Are you sure you want to deactivate ${dcCode}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, deactivate",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await deactivateDistributionCenter({ DCCode: dcCode });
      if (response && !response.Error) {
        notify.success(response.Message || "Distribution center deactivated successfully.");
        router.push("/admin/distribution-centers");
      } else {
        throw new Error(response?.Message || "Failed to deactivate distribution center.");
      }
    } catch (err) {
      console.error("Error deactivating distribution center:", err);
      notify.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="content">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!dcData) {
    return (
      <div className="content">
        <Alert variant="danger" className="text-center">
          <Building2 size={48} className="mb-3" />
          <h4>Distribution Center Not Found</h4>
          <p>The distribution center you're looking for doesn't exist or has been removed.</p>
          <Link to="/admin/distribution-centers" className="btn btn-primary">
            <ArrowLeft size={16} className="me-2" />
            Back to Distribution Centers
          </Link>
        </Alert>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Distribution Center Details</h4>
            <h6>{dcData.DCName}</h6>
          </div>
        </div>
        <div className="page-btn d-flex flex-wrap gap-2">
          <Link to="/admin/distribution-centers" className="btn btn-outline-secondary">
            <ArrowLeft size={16} className="me-2" />
            Back to Centers
          </Link>
          <Button variant="primary" onClick={() => setShowEditModal(true)}>
            <Edit3 size={16} className="me-2" />
            Edit
          </Button>
          <Button variant="danger" onClick={handleDeleteDC}>
            <Trash2 size={16} className="me-2" />
            Delete
          </Button>
          <Link to={`/admin/distribution-centers/${dcCode}/users`} className="btn btn-outline-primary">
            <Users size={16} className="me-2" />
            DC Users
          </Link>
        </div>
      </div>

      <Row>
        {/* DC Status Card */}
        <Col lg={12} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                    <Building2 className="text-primary" size={24} />
                  </div>
                  <div>
                    <h5 className="mb-1">{dcData.DCName}</h5>
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg={dcData.StatusID === 1 ? "success" : "danger"}>
                        {dcData.StatusID === 1 ? "Active" : "Inactive"}
                      </Badge>
                      {dcData.IsPrimary ? <Badge bg="primary">Primary</Badge> : null}
                    </div>
                  </div>
                </div>
                <div className="text-end">
                  <h6 className="text-muted mb-1">DC Code</h6>
                  <code className="fs-6">{dcData.DCCode}</code>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Center Information */}
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Center Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label text-muted">Center Name</label>
                    <p className="fw-bold">{dcData.DCName}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">City</label>
                    <p>{dcData.City || "N/A"}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Region</label>
                    <p>{dcData.Region || "N/A"}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Date Added</label>
                    <p>{dcData.DateAdded ? new Date(dcData.DateAdded).toLocaleDateString() : "N/A"}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label text-muted">Address</label>
                    <p className="mb-0">{dcData.AddressLine1 || "N/A"}</p>
                    {dcData.AddressLine2 && (
                      <small className="text-muted d-block">{dcData.AddressLine2}</small>
                    )}
                    {dcData.Landmark && (
                      <small className="text-muted d-block">Near: {dcData.Landmark}</small>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Coordinates</label>
                    <p>
                      {dcData.Latitude && dcData.Longitude
                        ? `${Number(dcData.Latitude).toFixed(6)}, ${Number(dcData.Longitude).toFixed(6)}`
                        : "No coordinates"}
                    </p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column gap-2">
              <Link to={`/admin/distribution-centers/${dcCode}/users`} className="btn btn-outline-primary">
                <Users size={16} className="me-2" />
                Manage DC Users
              </Link>
              <Link
                to={`/admin/packages?fromDCCode=${dcCode}`}
                className="btn btn-outline-secondary"
              >
                View Packages at this Center
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AddDistributionCenterModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditCenter}
        isLoading={isSaving}
        isEdit={true}
        initialData={dcData}
      />
    </div>
  );
};

export default DistributionCenterDetailPage;
