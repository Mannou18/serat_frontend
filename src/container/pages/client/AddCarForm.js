/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Modal, Select } from 'antd';
import carBrandService from '../../../config/api/carBrand.service';

const AddCarForm = ({ visible, onCancel, onSubmit, loading, resetTrigger, initialValues = {}, modalTitle = 'Ajouter une voiture', okText = 'Ajouter' }) => {
  const [form] = Form.useForm();
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loadingBrands, setLoadingBrands] = useState(false);

  const fetchBrands = async () => {
    setLoadingBrands(true);
    try {
      const response = await carBrandService.getAllBrandsWithQuery('isDeleted=false');
      const brandsData = Array.isArray(response) ? response : (response.brands || response.data || []);
      setBrands(brandsData);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoadingBrands(false);
    }
  };

  // Fetch brands when component mounts or modal becomes visible
  useEffect(() => {
    if (visible) {
      fetchBrands();
    }
  }, [visible]);

  // Reset form when resetTrigger changes
  useEffect(() => {
    if (resetTrigger > 0) {
      form.resetFields();
      setSelectedBrand(null);
    }
  }, [resetTrigger, form]);

  // Set initial values when they change
  useEffect(() => {
    if (visible && initialValues && Object.keys(initialValues).length > 0) {
      // If we have initialValues with brand as ObjectId, we need to find the brand name
      if (initialValues.brand && typeof initialValues.brand === 'object' && initialValues.brand._id) {
        const brand = brands.find(b => b._id === initialValues.brand._id);
        if (brand) {
          form.setFieldsValue({
            brand: brand._id,
            model_name: initialValues.model_name,
            matricule: initialValues.matricule,
            plate_number: initialValues.plate_number
          });
          setSelectedBrand(brand._id);
        }
      } else {
        form.setFieldsValue(initialValues);
        if (initialValues.brand) {
          setSelectedBrand(initialValues.brand);
        }
      }
    }
  }, [visible, initialValues, form, brands]);

  const handleBrandChange = (brandId) => {
    setSelectedBrand(brandId);
    // Reset model when brand changes
    form.setFieldsValue({ model_name: undefined });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Transform the values to match the new schema
      const transformedValues = {
        brand: values.brand, // This is now the brand's ObjectId
        model_name: values.model_name,
        matricule: values.matricule,
        plate_number: values.plate_number
      };
      onSubmit(transformedValues);
    } catch (error) {
      // Form validation error
    }
  };

  // Get models for the selected brand
  const getModelsForBrand = () => {
    const brand = brands.find(b => b._id === selectedBrand);
    return brand?.model_names || [];
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
        name="addCarForm"
      >
        <Form.Item
          name="brand"
          label="Marque"
          rules={[{ required: true, message: 'Veuillez sélectionner la marque du véhicule' }]}
        >
          <Select
            placeholder="Sélectionnez une marque"
            loading={loadingBrands}
            onChange={handleBrandChange}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {brands.map(brand => (
              <Select.Option key={brand._id} value={brand._id}>
                {brand.brand_name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="model_name"
          label="Modèle"
          rules={[{ required: true, message: 'Veuillez sélectionner le modèle du véhicule' }]}
        >
          <Select
            placeholder="Sélectionnez un modèle"
            disabled={!selectedBrand}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {getModelsForBrand().map(model => (
              <Select.Option key={model} value={model}>
                {model}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="matricule"
          label="Matricule"
          rules={[{ required: true, message: 'Veuillez entrer la matricule du véhicule' }]}
        >
          <Input placeholder="Ex: 01/23-0480" />
        </Form.Item>

        <Form.Item
          name="plate_number"
          label="Numéro de plaque"
          rules={[{ required: true, message: 'Veuillez entrer le numéro de plaque' }]}
        >
          <Input placeholder="Ex: 123TUN4321" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

AddCarForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  resetTrigger: PropTypes.number.isRequired,
  initialValues: PropTypes.object,
  modalTitle: PropTypes.string,
  okText: PropTypes.string,
};

export default AddCarForm; 