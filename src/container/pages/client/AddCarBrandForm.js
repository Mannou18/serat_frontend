import React from 'react';
import { Form, Input, Modal, Button } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import propTypes from 'prop-types';

function AddCarBrandForm({ visible, onCancel, onSubmit, isSubmitting, initialValues, isEdit }) {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue({
        brand_name: initialValues.brand_name,
        model_names:
          initialValues.model_names && initialValues.model_names.length > 0
            ? initialValues.model_names
            : [''],
      });
    } else if (visible) {
      form.setFieldsValue({ brand_name: '', model_names: [''] });
      form.resetFields();
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Modifier la marque' : 'Ajouter une marque'}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Annuler
        </Button>,
        <Button key="submit" type="primary" loading={isSubmitting} onClick={handleSubmit}>
          {isEdit ? 'Mettre à jour' : 'Ajouter'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        name="brandForm"
      >
        <Form.Item
          name="brand_name"
          label="Nom de la marque"
          rules={[{ required: true, message: 'Veuillez entrer le nom de la marque' }]}
        >
          <Input placeholder="Entrez le nom de la marque" />
        </Form.Item>

        <Form.List name="model_names">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} style={{ display: 'flex', marginBottom: 8 }}>
                  <Form.Item
                    {...restField}
                    name={name}
                    style={{ flex: 1, marginRight: 8 }}
                    rules={[{ required: true, message: 'Veuillez entrer le nom du modèle' }]}
                  >
                    <Input placeholder="Nom du modèle" />
                  </Form.Item>
                  {fields.length > 1 && (
                    <MinusCircleOutlined
                      onClick={() => remove(name)}
                      style={{ marginTop: 8 }}
                    />
                  )}
                </div>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Ajouter un modèle
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}

AddCarBrandForm.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
  onSubmit: propTypes.func.isRequired,
  isSubmitting: propTypes.bool,
  initialValues: propTypes.object,
  isEdit: propTypes.bool,
};

AddCarBrandForm.defaultProps = {
  isSubmitting: false,
  initialValues: null,
  isEdit: false,
};

export default AddCarBrandForm; 