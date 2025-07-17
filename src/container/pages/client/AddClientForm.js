import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Modal } from 'antd';

const AddClientForm = ({ visible, onCancel, onSubmit, loading, resetTrigger, initialValues = {}, modalTitle = 'Ajouter un client', okText = 'Ajouter' }) => {
  const [form] = Form.useForm();

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
        name="addClientForm"
      >
        <Form.Item
          name="fname"
          label="Nom"
          rules={[{ required: true, message: 'Veuillez entrer le nom' }]}
        >
          <Input placeholder="Entrez le nom" />
        </Form.Item>
        <Form.Item
          name="lname"
          label="Prénom"
          rules={[{ required: true, message: 'Veuillez entrer le prénom' }]}
        >
          <Input placeholder="Entrez le prénom" />
        </Form.Item>
        <Form.Item
          name="cin"
          label="CIN"
          rules={[
            { required: true, message: 'Veuillez entrer le CIN' },
            { pattern: /^\d+$/, message: 'Le CIN doit contenir uniquement des chiffres' },
          ]}
        >
          <Input placeholder="Entrez le CIN" />
        </Form.Item>
        <Form.Item
          name="phoneNumber"
          label="Téléphone"
          rules={[
            { required: true, message: 'Veuillez entrer le numéro de téléphone' },
            { pattern: /^\d{8}$/, message: 'Le numéro de téléphone doit contenir exactement 8 chiffres' },
          ]}
        >
          <Input placeholder="Entrez le numéro de téléphone" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

AddClientForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  resetTrigger: PropTypes.number.isRequired,
  initialValues: PropTypes.object,
  modalTitle: PropTypes.string,
  okText: PropTypes.string,
};

export default AddClientForm; 