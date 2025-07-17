/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, InputNumber, Modal, Select, Spin } from 'antd';
import categoryService from '../../../config/api/category.service';

const { Option } = Select;

const AddProductForm = ({ visible, onCancel, onSubmit, loading, resetTrigger, initialValues = {}, modalTitle = 'Ajouter un article', okText = 'Ajouter' }) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(Array.isArray(data) ? data : data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchCategories();
    }
  }, [visible]);

  useEffect(() => {
    if (resetTrigger > 0) {
      form.resetFields();
    }
  }, [resetTrigger, form]);

  useEffect(() => {
    if (visible && initialValues && Object.keys(initialValues).length > 0) {
      form.setFieldsValue(initialValues);
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      // Optionally show a message or just ignore
      // message.error('Veuillez remplir tous les champs obligatoires.');
    }
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
        name="addProductForm"
      >
        <Form.Item
          name="title"
          label="Nom de l'article"
          rules={[{ required: true, message: 'Veuillez entrer le nom de l\'article' }]}
        >
          <Input placeholder="Entrez le nom de l'article" />
        </Form.Item>

        <Form.Item
          name="b_price"
          label="Prix d'achat"
          rules={[{ required: true, message: 'Veuillez entrer le prix d\'achat' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={0.01}
            placeholder="Entrez le prix d'achat"
          />
        </Form.Item>

        <Form.Item
          name="s_price"
          label="Prix de vente"
          rules={[{ required: true, message: 'Veuillez entrer le prix de vente' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={0.01}
            placeholder="Entrez le prix de vente"
          />
        </Form.Item>

        <Form.Item
          name="stock"
          label="Stock"
          rules={[{ required: true, message: 'Veuillez entrer la quantité en stock' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            placeholder="Entrez la quantité en stock"
          />
        </Form.Item>

        <Form.Item
          name="categories"
          label="Catégories"
        >
          <Select
            mode="multiple"
            placeholder="Sélectionnez les catégories"
            loading={categoriesLoading}
            notFoundContent={categoriesLoading ? <Spin size="small" /> : null}
          >
            {categories.map((category) => (
              // eslint-disable-next-line no-underscore-dangle
              <Option key={category._id} value={category._id}>
                {category.title}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

AddProductForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  resetTrigger: PropTypes.number.isRequired,
  initialValues: PropTypes.object,
  modalTitle: PropTypes.string,
  okText: PropTypes.string,
};

export default AddProductForm; 