/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, InputNumber, Modal, Select } from 'antd';
import clientService from '../../../config/api/client.service';

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

const AddServiceForm = ({ visible, onCancel, onSubmit, loading, initialValues = {}, modalTitle = 'Nouveau Service', okText = 'Ajouter', clientId }) => {
  const [form] = Form.useForm();
  const [cars, setCars] = useState([]);
  const [carsLoading, setCarsLoading] = useState(false);

  useEffect(() => {
    if (visible && clientId) {
      setCarsLoading(true);
      clientService.getClient(clientId)
        .then(client => {
          setCars(client.cars || []);
        })
        .finally(() => setCarsLoading(false));
    }
  }, [visible, clientId]);

  useEffect(() => {
    if (visible && initialValues && Object.keys(initialValues).length > 0) {
      form.setFieldsValue(initialValues);
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Automatically assign clientId
      onSubmit({ ...values, customer: clientId });
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
        {/* Removed Client field */}
        <Form.Item
          name="car"
          label="Voiture"
          rules={[{ required: true, message: 'Veuillez sélectionner une voiture' }]}
        >
          <Select
            showSearch
            placeholder="Sélectionnez une voiture"
            loading={carsLoading}
            optionFilterProp="children"
            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            disabled={cars.length === 0}
          >
            {cars.map((car) => {
              const label = [car.brand?.brand_name, car.model_name, car.matricule || car.plate_number || car._id].filter(Boolean).join(' ');
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
  clientId: PropTypes.string.isRequired,
};

export default AddServiceForm; 