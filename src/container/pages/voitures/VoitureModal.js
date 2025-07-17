import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { useDispatch } from 'react-redux';
import { addVoiture, updateVoiture } from '../../../redux/voitures/actions';

const VoitureModal = ({ visible, onCancel, voiture }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    if (voiture) {
      form.setFieldsValue(voiture);
    } else {
      form.resetFields();
    }
  }, [voiture, form]);

  const handleFinish = (values) => {
    if (voiture) {
      dispatch(updateVoiture(voiture.id, values)).then(onCancel);
    } else {
      dispatch(addVoiture(values)).then(onCancel);
    }
  };

  return (
    <Modal
      visible={visible}
      title={voiture ? 'Modifier la voiture' : 'Ajouter une voiture'}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={voiture || {}}
      >
        <Form.Item
          label="Marque"
          name="marque"
          rules={[{ required: true, message: 'Veuillez saisir la marque' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Modèle"
          name="modele"
          rules={[{ required: true, message: 'Veuillez saisir le modèle' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Immatriculation"
          name="immatriculation"
          rules={[{ required: true, message: "Veuillez saisir l'immatriculation" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Propriétaire"
          name="proprietaire"
          rules={[{ required: true, message: 'Veuillez saisir le nom du propriétaire' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Téléphone"
          name="telephone"
          rules={[{ required: true, message: 'Veuillez saisir le téléphone' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item style={{ textAlign: 'right' }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Annuler
          </Button>
          <Button type="primary" htmlType="submit">
            {voiture ? 'Modifier' : 'Ajouter'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default VoitureModal; 