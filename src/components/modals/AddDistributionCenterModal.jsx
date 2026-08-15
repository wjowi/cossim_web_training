import { getCities, getDistributionCenterType } from "@/services/adminService";
import { useEffect, useState } from "react";

const AddCenterModal = ({
  show,
  onClose,
  onSubmit,
  isLoading,
  isEdit = false,
  initialData = {},
}) => {
  const [form, setForm] = useState({
    DCName: "",
    CityCode: "",
    Region: "",
    AddressLine1: "",
    AddressLine2: "",
    Landmark: "",
    Latitude: null,
    Longitude: null,
    IsPrimary: false,
    DistributionCenterTypeID: "",
  });
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [citiesFetched, setCitiesFetched] = useState(false);
  const [distributionCenterTypes, setDistributionCenterTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [typesFetched, setTypesFetched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Fetch cities and types when modal opens
  useEffect(() => {
    if (show && !citiesFetched) {
      fetchCities();
    }
  }, [show, citiesFetched]);

  useEffect(() => {
    if (show && !typesFetched) {
      fetchDistributionCenterTypes();
    }
  }, [show, typesFetched]);

  // Reset or populate form based on mode - only when modal opens or edit mode changes
  useEffect(() => {
    if (show) {
      if (isEdit && initialData) {
        setForm({
          DCName: initialData.DCName || "",
          CityCode: initialData.CityCode || "",
          Region: initialData.Region || "",
          AddressLine1: initialData.AddressLine1 || "",
          AddressLine2: initialData.AddressLine2 || "",
          Landmark: initialData.Landmark || "",
          Latitude: initialData.Latitude || null,
          Longitude: initialData.Longitude || null,
          IsPrimary: initialData.IsPrimary || false,
          DistributionCenterTypeID: initialData.DistributionCenterTypeID || "",
        });
      } else {
        setForm({
          DCName: "",
          CityCode: "",
          Region: "",
          AddressLine1: "",
          AddressLine2: "",
          Landmark: "",
          Latitude: null,
          Longitude: null,
          IsPrimary: false,
          DistributionCenterTypeID: "",
        });
      }
      setFormErrors({});
    }
  }, [show, isEdit]);

  const fetchCities = async () => {
    if (loadingCities || citiesFetched) return;

    try {
      setLoadingCities(true);

      const response = await getCities();

      if (response && !response.Error) {
        setCities(response.Data || []);
        setCitiesFetched(true);
      } else {
        setCities([]);
        setCitiesFetched(true);
      }
    } catch (error) {
      setCities([]);
      setCitiesFetched(true);
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchDistributionCenterTypes = async () => {
    if (loadingTypes || typesFetched) return;

    try {
      setLoadingTypes(true);

      const response = await getDistributionCenterType();

      if (response && !response.Error) {
        setDistributionCenterTypes(response.Data || []);
        setTypesFetched(true);
      } else {
        setDistributionCenterTypes([]);
        setTypesFetched(true);
      }
    } catch (error) {
      setDistributionCenterTypes([]);
      setTypesFetched(true);
    } finally {
      setLoadingTypes(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!form.DCName.trim()) {
      errors.DCName = "Distribution Center name is required";
    }

    if (!form.CityCode.trim()) {
      errors.CityCode = "City is required";
    }

    if (!form.Region.trim()) {
      errors.Region = "Region is required";
    }

    if (!form.AddressLine1.trim()) {
      errors.AddressLine1 = "Primary address is required";
    }

    if (!form.DistributionCenterTypeID) {
      errors.DistributionCenterTypeID = "Distribution Center type is required";
    }

    // Validate coordinates if provided
    if (form.Latitude !== null && form.Latitude !== "") {
      const lat = parseFloat(form.Latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.Latitude = "Latitude must be between -90 and 90";
      }
    }

    if (form.Longitude !== null && form.Longitude !== "") {
      const lng = parseFloat(form.Longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.Longitude = "Longitude must be between -180 and 180";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" || name === "DistributionCenterTypeID"
        ? (value ? parseFloat(value) : null)
        : value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitting(true);
      try {
        await onSubmit(form, isEdit ? initialData.DCCode : null); // Pass DCCode for updates
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (!show) return null;
  return (
    <div
      className="modal show"
      style={{ display: "block", background: "rgba(0,0,0,0.3)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content"
          style={{ background: "#ffe5d0", borderRadius: 12 }}
        >
          <div className="modal-header">
            <h5 className="modal-title">
              {isEdit
                ? "Edit Distribution Center"
                : "Create Distribution Center"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            <p style={{ color: "#a85b2a" }}>
              {isEdit
                ? "Update the distribution center details."
                : "Add a new distribution center to manage package processing and delivery operations."}
            </p>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Name *</label>
                  <input
                    name="DCName"
                    value={form.DCName}
                    onChange={handleChange}
                    className={`form-control ${
                      formErrors.DCName ? "is-invalid" : ""
                    }`}
                    placeholder="Distribution Center Name"
                    required
                    disabled={submitting}
                  />
                  {formErrors.DCName && (
                    <div className="invalid-feedback">{formErrors.DCName}</div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">City *</label>
                  <select
                    name="CityCode"
                    value={form.CityCode}
                    onChange={handleChange}
                    className={`form-select ${
                      formErrors.CityCode ? "is-invalid" : ""
                    }`}
                    required
                    disabled={submitting || loadingCities}
                  >
                    <option value="">
                      {loadingCities ? "Loading cities..." : "Select city"}
                    </option>
                    {cities.map((city, index) => (
                      <option
                        key={city.CityCode || index}
                        value={city.CityCode || city}
                      >
                        {city.CityName || city}
                      </option>
                    ))}
                  </select>
                  {formErrors.CityCode && (
                    <div className="invalid-feedback">
                      {formErrors.CityCode}
                    </div>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Distribution Center Type *</label>
                  <select
                    name="DistributionCenterTypeID"
                    value={form.DistributionCenterTypeID}
                    onChange={handleChange}
                    className={`form-select ${
                      formErrors.DistributionCenterTypeID ? "is-invalid" : ""
                    }`}
                    required
                    disabled={submitting || loadingTypes}
                  >
                    <option value="">
                      {loadingTypes ? "Loading types..." : "Select type"}
                    </option>
                    {distributionCenterTypes.map((type, index) => (
                      <option
                        key={type.DistributionCenterTypeID || index}
                        value={type.DistributionCenterTypeID || type}
                      >
                        {type.DistributionCenterTypeName || type}
                      </option>
                    ))}
                  </select>
                  {formErrors.DistributionCenterTypeID && (
                    <div className="invalid-feedback">
                      {formErrors.DistributionCenterTypeID}
                    </div>
                  )}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-8">
                  <label className="form-label">Region *</label>
                  <input
                    name="Region"
                    value={form.Region}
                    onChange={handleChange}
                    className={`form-control ${
                      formErrors.Region ? "is-invalid" : ""
                    }`}
                    placeholder="e.g., Central Kenya"
                    required
                    disabled={submitting}
                  />
                  {formErrors.Region && (
                    <div className="invalid-feedback">{formErrors.Region}</div>
                  )}
                </div>

                <div className="col-md-4 d-flex align-items-center" style={{ gap: 8 }}>
                  <input
                    name="IsPrimary"
                    type="checkbox"
                    checked={form.IsPrimary}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        IsPrimary: e.target.checked,
                      }))
                    }
                    className={`form-check-input ${
                      formErrors.IsPrimary ? "is-invalid" : ""
                    }`}
                    style={{ width: 20, height: 20, marginTop: 0 }}
                    disabled={submitting}
                    id="isPrimaryCheckbox"
                  />
                  <label
                    className="form-label mb-0"
                    htmlFor="isPrimaryCheckbox"
                    style={{ userSelect: "none", cursor: "pointer" }}
                  >
                    Is Primary
                  </label>
                  {formErrors.IsPrimary && (
                    <div className="invalid-feedback">
                      {formErrors.IsPrimary}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Address Line 1 *</label>
                <input
                  name="AddressLine1"
                  value={form.AddressLine1}
                  onChange={handleChange}
                  className={`form-control ${
                    formErrors.AddressLine1 ? "is-invalid" : ""
                  }`}
                  placeholder="Primary Address"
                  required
                  disabled={submitting}
                />
                {formErrors.AddressLine1 && (
                  <div className="invalid-feedback">
                    {formErrors.AddressLine1}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Address Line 2</label>
                <input
                  name="AddressLine2"
                  value={form.AddressLine2}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Secondary Address (Optional)"
                  disabled={submitting}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Landmark</label>
                <input
                  name="Landmark"
                  value={form.Landmark}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Nearby Landmark (Optional)"
                  disabled={submitting}
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Latitude</label>
                  <input
                    name="Latitude"
                    type="number"
                    step="any"
                    value={form.Latitude || ""}
                    onChange={handleChange}
                    className={`form-control ${
                      formErrors.Latitude ? "is-invalid" : ""
                    }`}
                    placeholder="e.g., -1.286389"
                    disabled={submitting}
                  />
                  {formErrors.Latitude && (
                    <div className="invalid-feedback">
                      {formErrors.Latitude}
                    </div>
                  )}
                  <small className="form-text text-muted">
                    Range: -90 to 90
                  </small>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Longitude</label>
                  <input
                    name="Longitude"
                    type="number"
                    step="any"
                    value={form.Longitude || ""}
                    onChange={handleChange}
                    className={`form-control ${
                      formErrors.Longitude ? "is-invalid" : ""
                    }`}
                    placeholder="e.g., 36.817223"
                    disabled={submitting}
                  />
                  {formErrors.Longitude && (
                    <div className="invalid-feedback">
                      {formErrors.Longitude}
                    </div>
                  )}
                  <small className="form-text text-muted">
                    Range: -180 to 180
                  </small>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-fill"
                  style={{ background: "#e97b3a", border: "none" }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      {isEdit ? "Updating..." : "Creating..."}
                    </>
                  ) : isEdit ? (
                    "Update Distribution Center"
                  ) : (
                    "Create Distribution Center"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCenterModal;
