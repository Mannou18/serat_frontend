/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, InputNumber, Modal, Select } from 'antd';

const { Option } = Select;

const SERVICE_TYPE_OPTIONS = [
  { value: 'maintenance', label: 'Entretien' },
  { value: 'repair', label: 'Réparation' },
  { value: 'inspection', label: 'Contrôle technique' },
  { value: 'installation', label: 'Installation' },
  { value: 'other', label: 'Autre' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Faible' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' },
];

const AddServiceForm = ({ visible, onCancel, onSubmit, loading, initialValues = {}, modalTitle = 'Nouveau Service', okText = 'Ajouter', clients = [], brands = [] }) => {
  const [form] = Form.useForm();
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    if (visible && initialValues && Object.keys(initialValues).length > 0) {
      form.setFieldsValue(initialValues);
      if (initialValues.customer) setSelectedClient(initialValues.customer);
    } else if (visible) {
      form.resetFields();
      setSelectedClient(null);
    }
  }, [visible, initialValues, form]);

  const handleClientChange = (value) => {
    setSelectedClient(value);
    form.setFieldsValue({ car: undefined }); // reset car when client changes
  };

  const selectedClientObj = clients.find(c => (c._id || c.id) === selectedClient);
  const clientCars = selectedClientObj?.cars || [];

  // Debug logs
  console.log('Selected client:', selectedClient);
  console.log('Selected client object:', selectedClientObj);
  console.log('Client cars:', clientCars);

  const getBrandName = (brandId) => {
    const brand = brands.find(b => b._id === brandId);
    return brand ? brand.brand_name : 'Inconnu';
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit({ ...values, customer: selectedClient });
    } catch (error) {/* ignore */}
  };

  return (
    <Modal
      title={modalTitle}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText={okText}
      cancelText="Annuler"
    >
      <Form
        form={form}
        layout="vertical"
        name="addServiceForm"
      >
        <Form.Item
          name="customer"
          label="Client"
          rules={[{ required: true, message: 'Veuillez sélectionner un client' }]}
        >
          <Select
            showSearch
            placeholder="Sélectionnez un client"
            optionFilterProp="children"
            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            onChange={handleClientChange}
            value={selectedClient}
            disabled={loading || clients.length === 0}
          >
            {clients.map(client => {
              const label = `${client.fname || ''} ${client.lname || ''} - ${client.phoneNumber || client.cin || ''}`.trim();
              return (
                <Option key={client._id || client.id} value={client._id || client.id}>
                  {label}
                </Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item
          name="car"
          label="Voiture"
          rules={[{ required: true, message: 'Veuillez sélectionner une voiture' }]}
        >
          <Select
            showSearch
            placeholder={selectedClient ? "Sélectionnez une voiture" : "Sélectionnez d'abord un client"}
            loading={loading}
            optionFilterProp="children"
            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            disabled={!selectedClient || clientCars.length === 0}
          >
            {clientCars.map((car) => {
              const label = `${getBrandName(car.brand)} ${car.model_name || ''} - ${car.matricule || car.plate_number || car._id}`;
              return (
                <Option key={car._id || car.id} value={car._id || car.id}>
                  {label}
                </Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item
          name="serviceType"
          label="Type de Service"
          rules={[{ required: true, message: 'Veuillez sélectionner le type de service' }]}
        >
          <Select placeholder="Type de service">
            {SERVICE_TYPE_OPTIONS.map(opt => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Veuillez entrer la description' }]}
        >
          <Input.TextArea rows={3} placeholder="Description du service" />
        </Form.Item>
        <Form.Item
          name="estimatedCost"
          label="Coût estimé (DT)"
          rules={[{ required: true, message: 'Veuillez entrer le coût estimé' }]}
        >
          <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Coût estimé du service" />
        </Form.Item>
        <Form.Item
          name="priority"
          label="Priorité"
          rules={[{ required: true, message: 'Veuillez sélectionner la priorité' }]}
        >
          <Select placeholder="Priorité du service">
            {PRIORITY_OPTIONS.map(opt => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="notes"
          label="Notes"
        >
          <Input.TextArea rows={2} placeholder="Notes supplémentaires" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

AddServiceForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  initialValues: PropTypes.object,
  modalTitle: PropTypes.string,
  okText: PropTypes.string,
  clients: PropTypes.array,
  brands: PropTypes.array,
};

export default AddServiceForm; 