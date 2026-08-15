import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import Select from "react-select";
import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { enUS } from 'date-fns/locale/en-US';
import PropTypes from "prop-types";
import { useAdmin } from "@/hooks/useAdmin";
import { useShipment } from "@/hooks/useShipment";

// Register English locale (you can change this to your preferred locale)
registerLocale('en-US', enUS);

// Set default locale for all date pickers
setDefaultLocale('en-US');

const AddRoutePricingModal = ({
  show,
  onHide,
  formData,
  onInputChange,
  onSubmit,
  loading = false,
}) => {
  // Hooks for fetching data
  const { distributionCenters, fetchDistributionCenters } = useAdmin();
  const { deliveryTypes, fetchDeliveryTypes } = useShipment();

  // Local state for select values
  const [selectedFromDC, setSelectedFromDC] = useState(null);
  const [selectedToDC, setSelectedToDC] = useState(null);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState(null);

  // Local state for date pickers
  const [effectiveFromDate, setEffectiveFromDate] = useState(null);
  const [effectiveToDate, setEffectiveToDate] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    console.log('AddRoutePricingModal show:', distributionCenters);
    if (show) {
      fetchDistributionCenters();
      fetchDeliveryTypes();
    }
  }, [show, fetchDistributionCenters, fetchDeliveryTypes]);

  // Update local state when formData changes
  useEffect(() => {
    // Ensure arrays are available before using find
    if (!Array.isArray(distributionCenters) || !Array.isArray(deliveryTypes)) {
      return;
    }

    const fromDC = distributionCenters.find(dc => dc.DCCode === formData.fromDCCode);
    const toDC = distributionCenters.find(dc => dc.DCCode === formData.toDCCode);
    const deliveryType = deliveryTypes.find(dt => dt.DeliveryTypeCode === formData.deliveryTypeCode);

    setSelectedFromDC(fromDC ? { value: fromDC.DCCode, label: `${fromDC.DCName} (${fromDC.DCCode})` } : null);
    setSelectedToDC(toDC ? { value: toDC.DCCode, label: `${toDC.DCName} (${toDC.DCCode})` } : null);
    setSelectedDeliveryType(deliveryType ? { value: deliveryType.DeliveryTypeCode, label: deliveryType.DeliveryTypeName } : null);

    // Sync date picker state with formData
    setEffectiveFromDate(formData.effectiveFrom ? new Date(formData.effectiveFrom + (formData.effectiveFrom.includes('T') ? '' : 'T00:00')) : null);
    setEffectiveToDate(formData.effectiveTo ? new Date(formData.effectiveTo + (formData.effectiveTo.includes('T') ? '' : 'T00:00')) : null);
  }, [formData, distributionCenters, deliveryTypes]);

  // Transform distribution centers for select options
  const dcOptions = Array.isArray(distributionCenters) 
    ? distributionCenters
        .filter(dc => dc.StatusID === 1 && dc.DCCode !== formData.fromDCCode) // Only active DCs, exclude selected From DC
        .map(dc => ({
          value: dc.DCCode,
          label: `${dc.DCName} (${dc.DCCode}) - ${dc.CityName}`,
          dcData: dc
        }))
    : [];

  const fromDcOptions = Array.isArray(distributionCenters) 
    ? distributionCenters
        .filter(dc => dc.StatusID === 1 && dc.IsPrimary) // Only active DCs
        .map(dc => ({
          value: dc.DCCode,
          label: `${dc.DCName} (${dc.DCCode}) - ${dc.CityName}`,
          dcData: dc
        }))
    : [];

  // Transform delivery types for select options
  const deliveryTypeOptions = Array.isArray(deliveryTypes)
    ? deliveryTypes
        .filter(dt => dt.StatusID === 1) // Only active delivery types
        .map(dt => ({
          value: dt.DeliveryTypeCode,
          label: dt.DeliveryTypeName,
          deliveryTypeData: dt
        }))
    : [];

  // Handle select changes
  const handleFromDCChange = (selectedOption) => {
    setSelectedFromDC(selectedOption);
    onInputChange({
      target: {
        name: 'fromDCCode',
        value: selectedOption ? selectedOption.value : ''
      }
    });

    // Clear To DC if it matches the newly selected From DC
    if (selectedOption && formData.toDCCode === selectedOption.value) {
      setSelectedToDC(null);
      onInputChange({
        target: {
          name: 'toDCCode',
          value: ''
        }
      });
    }
  };

  const handleToDCChange = (selectedOption) => {
    setSelectedToDC(selectedOption);
    onInputChange({
      target: {
        name: 'toDCCode',
        value: selectedOption ? selectedOption.value : ''
      }
    });
  };

  const handleDeliveryTypeChange = (selectedOption) => {
    setSelectedDeliveryType(selectedOption);
    onInputChange({
      target: {
        name: 'deliveryTypeCode',
        value: selectedOption ? selectedOption.value : ''
      }
    });
  };

  // Handle date picker changes
  const handleEffectiveFromChange = (date) => {
    setEffectiveFromDate(date);
    onInputChange({
      target: {
        name: 'effectiveFrom',
        value: date ? formatLocalDateTime(date) : ''
      }
    });
  };

  const handleEffectiveToChange = (date) => {
    setEffectiveToDate(date);
    onInputChange({
      target: {
        name: 'effectiveTo',
        value: date ? formatLocalDateTime(date) : ''
      }
    });
  };

  // Helper function to format date in local timezone
  const formatLocalDateTime = (date) => {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Reset selections when modal is hidden
  useEffect(() => {
    if (!show) {
      setSelectedFromDC(null);
      setSelectedToDC(null);
      setSelectedDeliveryType(null);
      setEffectiveFromDate(null);
      setEffectiveToDate(null);
    }
  }, [show]);
  // Custom styles for react-select to match Bootstrap theme
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? '#80bdff' : '#ced4da',
      boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0,123,255,.25)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#80bdff' : '#adb5bd'
      }
    }),
    option: (base, state) => {
      let backgroundColor = 'white';
      if (state.isSelected) {
        backgroundColor = '#007bff';
      } else if (state.isFocused) {
        backgroundColor = '#f8f9fa';
      }

      return {
        ...base,
        backgroundColor,
        color: state.isSelected ? 'white' : '#495057',
        '&:hover': {
          backgroundColor: state.isSelected ? '#007bff' : '#f8f9fa'
        }
      };
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add New Route Pricing</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>From DC Code *</Form.Label>
                <Select
                  options={fromDcOptions}
                  value={selectedFromDC}
                  onChange={handleFromDCChange}
                  placeholder="Select source distribution center"
                  isClearable
                  isSearchable
                  className="react-select"
                  classNamePrefix="select"
                  styles={selectStyles}
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>To DC Code *</Form.Label>
                <Select
                  options={dcOptions}
                  value={selectedToDC}
                  onChange={handleToDCChange}
                  placeholder="Select destination distribution center"
                  isClearable
                  isSearchable
                  className="react-select"
                  classNamePrefix="select"
                  styles={selectStyles}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Delivery Type Code *</Form.Label>
                <Select
                  options={deliveryTypeOptions}
                  value={selectedDeliveryType}
                  onChange={handleDeliveryTypeChange}
                  placeholder="Select delivery type"
                  isClearable
                  isSearchable
                  className="react-select"
                  classNamePrefix="select"
                  styles={selectStyles}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>SLA Hours</Form.Label>
                <Form.Control
                  type="number"
                  name="slaHours"
                  value={formData.slaHours}
                  onChange={onInputChange}
                  placeholder="Enter SLA hours"
                  min="0"
                  step="0.01"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Rate Amount *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="rateAmount"
                  value={formData.rateAmount}
                  onChange={onInputChange}
                  placeholder="Enter rate amount"
                  required
                  min="0"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Effective From</Form.Label>
                <DatePicker
                  selected={effectiveFromDate}
                  onChange={handleEffectiveFromChange}
                  showTimeSelect
                  timeFormat="h:mm aa"
                  timeIntervals={5}
                  timeCaption="Time"
                  dateFormat="yyyy-MM-dd h:mm aa"
                  placeholderText="Select effective from date and time"
                  className="form-control"
                  wrapperClassName="w-100"
                  locale="en-US"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  minDate={new Date()}
                  isClearable
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Effective To</Form.Label>
                <DatePicker
                  selected={effectiveToDate}
                  onChange={handleEffectiveToChange}
                  showTimeSelect
                  timeFormat="h:mm aa"
                  timeIntervals={5}
                  timeCaption="Time"
                  dateFormat="yyyy-MM-dd h:mm aa"
                  placeholderText="Select effective to date and time"
                  className="form-control"
                  wrapperClassName="w-100"
                  locale="en-US"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  minDate={effectiveFromDate || new Date()}
                  isClearable
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={onSubmit}
          disabled={loading || !formData.rateAmount || !formData.fromDCCode || !formData.toDCCode || !formData.deliveryTypeCode}
        >
          {loading ? 'Creating...' : 'Create Route Pricing'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

AddRoutePricingModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    fromDCCode: PropTypes.string,
    toDCCode: PropTypes.string,
    deliveryTypeCode: PropTypes.string,
    slaHours: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rateAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    effectiveFrom: PropTypes.string,
    effectiveTo: PropTypes.string,
  }).isRequired,
  onInputChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default AddRoutePricingModal;
