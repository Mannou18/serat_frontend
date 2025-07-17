import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, InputNumber, Modal, Select, Tag, message } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import productService from '../../../config/api/product.service';

const { Option } = Select;

// Helper function to safely extract numeric value from MongoDB Decimal or regular number
const extractNumericValue = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  if (value && typeof value === 'object' && value.$numberDecimal) {
    return parseFloat(value.$numberDecimal) || 0;
  }
  return 0;
};

const AddSaleForm = ({ visible, onCancel, onSubmit, loading, resetTrigger, initialValues = {}, modalTitle = 'Nouvelle Vente', okText = 'Ajouter', clientId }) => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  // Calculate total amount based on selected products and quantities
  const calculateTotal = (productsList) => {
    let total = 0;
    if (productsList && productsList.length > 0) {
      productsList.forEach((item) => {
        if (item.product && item.quantity) {
          // eslint-disable-next-line no-underscore-dangle
          const selectedProduct = products.find(p => (p._id || p.id) === item.product);
          if (selectedProduct) {
            const price = extractNumericValue(selectedProduct.s_price);
            total += price * item.quantity;
          }
        }
      });
    }
    setTotalAmount(total);
    form.setFieldsValue({ totalAmount: total });
  };

  useEffect(() => {
    if (visible) {
      setProductsLoading(true);
      productService.getAllProducts(1, 1000).then(res => {
        setProducts(res.products || res.data || []);
        setProductsLoading(false);
      });
    }
  }, [visible]);

  useEffect(() => {
    if (resetTrigger > 0) {
      form.resetFields();
      setTotalAmount(0);
    }
  }, [resetTrigger, form]);

  useEffect(() => {
    if (visible && initialValues && Object.keys(initialValues).length > 0) {
      form.setFieldsValue(initialValues);
      // Calculate initial total if editing
      if (initialValues.products && initialValues.products.length > 0) {
        calculateTotal(initialValues.products);
      }
    }
  }, [visible, initialValues, form]);

  // Watch for changes in products and quantities
  useEffect(() => {
    const productsList = form.getFieldValue('products');
    if (productsList) {
      calculateTotal(productsList);
    }
  }, [form.getFieldValue('products'), products]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Ensure totalAmount is set correctly
      values.totalAmount = totalAmount;
      values.customer = clientId; // Always set customer to clientId
      console.log('Submitting sale values:', values);
      onSubmit(values);
    } catch (error) {
      console.error('Form validation error:', error);
      
      // If it's a validation error, show the first error message
      if (error.errorFields && error.errorFields.length > 0) {
        const firstError = error.errorFields[0];
        const errorMessage = firstError.errors?.[0] || 'Veuillez corriger les erreurs dans le formulaire';
        message.error(errorMessage);
      } else {
        message.error('Erreur de validation du formulaire');
      }
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
        name="addSaleForm"
      >
        {/* Client dropdown removed */}
        <Form.List name="products" rules={[{ required: true, message: 'Veuillez ajouter au moins un article' }]}> 
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, idx) => {
                // Get or create a unique row ID for this field
                let rowId = form.getFieldValue(['products', field.name, '_rowId']);
                if (!rowId) {
                  rowId = uuidv4();
                  // Set the rowId in the form state
                  form.setFields([
                    { name: ['products', field.name, '_rowId'], value: rowId }
                  ]);
                }
                
                console.log('Rendering product row:', { field, idx, rowId });
                
                return (
                  <div key={rowId} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <Form.Item
                      key={`${rowId}-product`}
                      {...field}
                      name={[field.name, 'product']}
                      fieldKey={[field.fieldKey, 'product']}
                      rules={[{ required: true, message: 'Sélectionnez un article' }]}
                      style={{ flex: 2 }}
                    >
                      <Select
                        showSearch
                        placeholder="Article"
                        loading={productsLoading}
                        optionFilterProp="children"
                        filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                        onChange={() => {
                          // Recalculate total when product changes
                          const productsList = form.getFieldValue('products');
                          calculateTotal(productsList);
                        }}
                      >
                        {products.map((product) => {
                          const price = extractNumericValue(product.s_price);
                          return (
                            // eslint-disable-next-line no-underscore-dangle
                            <Option key={product._id || product.id} value={product._id || product.id}>
                              {product.title} - {price.toFixed(2)} DT
                            </Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      key={`${rowId}-quantity`}
                      {...field}
                      name={[field.name, 'quantity']}
                      fieldKey={[field.fieldKey, 'quantity']}
                      rules={[{ required: true, message: 'Quantité requise' }]}
                      style={{ flex: 1 }}
                    >
                      <InputNumber 
                        min={1} 
                        placeholder="Quantité" 
                        style={{ width: '100%' }} 
                        onChange={() => {
                          // Recalculate total when quantity changes
                          const productsList = form.getFieldValue('products');
                          calculateTotal(productsList);
                        }}
                      />
                    </Form.Item>
                    <button
                      type="button"
                      key={`${rowId}-remove`}
                      onClick={() => {
                        remove(field.name);
                        // Recalculate total after removal
                        setTimeout(() => {
                          const productsList = form.getFieldValue('products');
                          calculateTotal(productsList);
                        }, 100);
                      }}
                      style={{ color: 'red', marginTop: 8, background: 'none', border: 'none', cursor: 'pointer' }}
                      aria-label="Supprimer l'article"
                    >
                      Supprimer
                    </button>
                  </div>
                );
              })}
              <Form.Item>
                <button
                  type="button"
                  onClick={() => add({ _rowId: uuidv4() })}
                  style={{ color: '#1890ff', background: 'none', border: 'none', cursor: 'pointer' }}
                  aria-label="Ajouter un article"
                >
                   Ajouter un article
                </button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item
          name="totalAmount"
          label="Montant total (DT)"
          rules={[{ required: true, message: 'Veuillez entrer le montant total' }]}
        >
          <InputNumber 
            min={0} 
            step={0.01} 
            style={{ width: '100%' }} 
            placeholder="Montant total" 
            value={totalAmount}
            disabled
          />
        </Form.Item>
        {form.getFieldValue('paymentStatus') && (
          <Form.Item
            name="paymentStatus"
            label="Statut Paiement"
          >
            <Tag
              style={{
                fontWeight: 500,
                fontSize: 12,
                borderRadius: 3,
                padding: '0 8px',
                lineHeight: '22px',
                height: 22,
                display: 'inline-block',
                letterSpacing: 0.5,
                background: (form.getFieldValue('paymentStatus') === 'en_cours') ? '#ff9800'
                  : (form.getFieldValue('paymentStatus') === 'pending') ? '#1890ff'
                  : (form.getFieldValue('paymentStatus') === 'paid') ? '#52c41a'
                  : '#bfbfbf',
                color: '#fff',
                border: 'none'
              }}
            >
              {(form.getFieldValue('paymentStatus') || '').replace('_', ' ').toUpperCase()}
            </Tag>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

AddSaleForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  resetTrigger: PropTypes.number.isRequired,
  initialValues: PropTypes.object,
  modalTitle: PropTypes.string,
  okText: PropTypes.string,
  clientId: PropTypes.string.isRequired,
};

export default AddSaleForm; 