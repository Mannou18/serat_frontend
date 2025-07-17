/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Spin, message, Row, Col, Card, Divider, Button, Alert } from 'antd';
import { ExclamationCircleOutlined, UserAddOutlined, CarOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import clientService from '../../../config/api/client.service';

const AddNeotrack = ({ visible, onCancel, onSubmit, loading, initialValues, error }) => {
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState([]);
  const [carsLoading, setCarsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [clientCars, setClientCars] = useState([]);

  useEffect(() => {
    if (visible) {
      setFetching(true);
      clientService.getAllClients(1, 1000)
        .then((clientsRes) => {
          setCustomers(clientsRes.customers || clientsRes.data || []);
        })
        .finally(() => setFetching(false));
    }
  }, [visible]);

  // Fetch client and their cars when client changes
  useEffect(() => {
    if (selectedClient) {
      setCarsLoading(true);
      clientService.getClient(selectedClient)
        .then((client) => {
          setClientCars(client.cars || []);
        })
        .finally(() => setCarsLoading(false));
    } else {
      setClientCars([]);
    }
    // Reset car and price fields when client changes
    form.setFieldsValue({ car: undefined, price: undefined });
    setSelectedCar(null);
  }, [selectedClient, form]);

  // When car changes, set price (if available, else clear)
  useEffect(() => {
    if (selectedCar) {
      const carObj = clientCars.find((c) => c._id === selectedCar || c.id === selectedCar);
      if (carObj && carObj.price) {
        form.setFieldsValue({ price: carObj.price });
      } else {
        form.setFieldsValue({ price: undefined });
      }
    }
  }, [selectedCar, clientCars, form]);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedClient(null);
      setSelectedCar(null);
      if (initialValues && Object.keys(initialValues).length > 0) {
        form.setFieldsValue({
          customer: initialValues.customer || null,
          car: initialValues.car || null,
          price: typeof initialValues.price === 'number' ? initialValues.price : Number(initialValues.price) || null,
          imei: initialValues.imei || '',
          simNumber: initialValues.simNumber || '',
          boitierId: initialValues.boitierId || '',
        });
        setSelectedClient(initialValues.customer || null);
        setSelectedCar(initialValues.car || null);
      }
    }
  }, [visible, initialValues, form]);

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setSelectedClient(null);
      setSelectedCar(null);
    }
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // Find selected client and car objects
      const client = customers.find(c => c._id === selectedClient);
      const car = clientCars.find(c => c._id === selectedCar || c.id === selectedCar);

      // Use static values for dob/year if missing
      const dobValue = client?.dob
        ? (typeof client.dob === 'string' && client.dob.trim() !== ''
            ? client.dob
            : (client.dob.toISOString ? client.dob.toISOString().slice(0, 10) : '1990-01-01'))
        : '1990-01-01';
      const yearValue = car?.year && String(car.year).trim() !== '' ? car.year : 2020;
      // Use default avatar if profile_photo missing
      const profilePhotoValue = client?.profile_photo && client.profile_photo.trim() !== ''
        ? client.profile_photo
        : '/uploads/my_pic.jpg';

      // Build request body with correct mapping
      const requestBody = {
        fname: client?.fname || '',
        lname: client?.lname || '',
        cin: client?.cin || '',
        dob: dobValue,
        phone: client?.phoneNumber || '',
        profile_photo: profilePhotoValue,
        plate_number: car?.plate_number || car?.matricule || '',
        brand: car?.brand?.brand_name || car?.brand || '',
        model: car?.model_name || car?.model || '',
        year: yearValue,
        imei: values.imei,
        sim_device: values.simNumber, // Numéro SIM Boitier
        price: values.price, // Send price to backend
      };
      // Call onSubmit with the mapped request body
      onSubmit(requestBody);
    } catch (e) {
      if (e && e.errorFields) {
        console.log('Validation failed fields:', e.errorFields);
      }
      message.error('Veuillez remplir tous les champs obligatoires.');
    }
  };

  return (
    <Modal
      title={initialValues && initialValues._id ? 'Modifier Neotrack' : 'Ajouter Neotrack'}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      okText={initialValues && initialValues._id ? 'Mettre à jour' : 'Ajouter'}
      cancelText="Annuler"
      destroyOnClose
      bodyStyle={{ maxHeight: 700, overflowY: 'auto' }}
      centered
      width={1050}
    >
      <Spin spinning={fetching}>
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24, fontWeight: 600, fontSize: 15, borderRadius: 8 }}
          />
        )}
        <div
          style={{
            background: '#fff6f6',
            border: '1.5px dashed #ff4d4f',
            borderRadius: 8,
            padding: 24,
            marginBottom: 32,
            maxWidth: 900,
            margin: '0 auto',
            boxShadow: '0 2px 12px 0 rgba(255,77,79,0.07)',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <ExclamationCircleOutlined style={{ color: '#d4380d', fontSize: 32, marginRight: 10 }} />
            <span style={{ color: '#b71c1c', fontWeight: 600, fontSize: 16, lineHeight: 1.7 }}>
              Avant de procéder, vous devez envoyer ces SMS vers le numéro du SIM du boitier :
            </span>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: 16,
              width: '100%',
            }}
          >
            <div style={{ background: '#fff0f0', border: '1px solid #ffccc7', borderRadius: 8, height: 140, padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <pre style={{
                background: 'none',
                color: '#b71c1c',
                fontFamily: 'monospace',
                fontSize: 14,
                margin: 0,
                padding: 0,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
              }}>{`SMS1 : AJ+MAT=id_boitier#9999\n  ## Vous attendez quelques instants vous devez recevoir un SMS 'OK' ##`}</pre>
            </div>
            <div style={{ background: '#fff0f0', border: '1px solid #ffccc7', borderRadius: 8, height: 140, padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <pre style={{
                background: 'none',
                color: '#b71c1c',
                fontFamily: 'monospace',
                fontSize: 14,
                margin: 0,
                padding: 0,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
              }}>{`SMS2 : AJ+APN=internet.ooredoo.tn#9999\n  ## Vous attendez quelques instants vous devez recevoir un SMS 'OK' ##`}</pre>
            </div>
            <div style={{ background: '#fff0f0', border: '1px solid #ffccc7', borderRadius: 8, height: 140, padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <pre style={{
                background: 'none',
                color: '#b71c1c',
                fontFamily: 'monospace',
                fontSize: 14,
                margin: 0,
                padding: 0,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
              }}>{`SMS3 :\n  AJ+IP=20.79.41.135#9999\n  AJ+PORT=40028#9999\n  ## Vous attendez quelques instants vous devez recevoir un SMS 'OK' ##`}</pre>
            </div>
            <div style={{ background: '#fff0f0', border: '1px solid #ffccc7', borderRadius: 8, height: 140, padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <pre style={{
                background: 'none',
                color: '#b71c1c',
                fontFamily: 'monospace',
                fontSize: 14,
                margin: 0,
                padding: 0,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
              }}>{`SMS4 :\n  AJ+D@#9999\n  ## Vous n'allez rien recevoir, vous pouvez procéder maintenant ##`}</pre>
            </div>
          </div>
        </div>
        <div style={{ marginBottom: 8 }} />
        <Card style={{ background: '#fafbfc', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', marginBottom: 0, border: 'none' }}>
          <Form
            form={form}
            layout="vertical"
            validateTrigger="onBlur"
            onFinishFailed={({ errorFields, values }) => {
              console.log('Validation failed:', errorFields);
              console.log('Form values on fail:', values);
              message.error('Veuillez remplir tous les champs obligatoires.');
            }}
          >
            <Row gutter={16} style={{ marginBottom: 0 }}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item name="customer" label={<span style={{ fontWeight: 600, textAlign: 'left' }}>Client</span>} rules={[{ required: true, message: 'Veuillez sélectionner un client' }]}> 
                  <Select
                    showSearch
                    optionFilterProp="children"
                    placeholder="Sélectionnez un client"
                    onChange={val => setSelectedClient(val)}
                    value={selectedClient}
                  >
                    {customers.map((c) => (
                      <Select.Option key={c._id} value={c._id}>{c.fname} {c.lname} - {c.phoneNumber}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                {/* Action button OUTSIDE Form.Item */}
                <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 12 }}>
                  <Button
                    type="link"
                    icon={<UserAddOutlined style={{ fontSize: 15, marginRight: 2 }} />}
                    href="/dashboard/clients/list"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 13, padding: 0 }}
                  >
                    Ajouter un client
                  </Button>
                </div>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item name="car" label={<span style={{ fontWeight: 600, textAlign: 'left' }}>Voiture</span>} rules={[{ required: true, message: 'Veuillez sélectionner une voiture' }]}> 
                  <Select
                    showSearch
                    placeholder="Sélectionnez une voiture"
                    loading={carsLoading}
                    optionFilterProp="children"
                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                    disabled={clientCars.length === 0}
                    onChange={val => setSelectedCar(val)}
                    value={selectedCar}
                  >
                    {clientCars.map((car) => {
                      const label = [car.brand?.brand_name, car.model_name, car.matricule || car._id].filter(Boolean).join(' ');
                      return (
                        <Select.Option key={car._id || car.id} value={car._id || car.id}>
                          {label}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Form.Item>
                {/* Action button OUTSIDE Form.Item */}
                <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 12 }}>
                  <Button
                    type="link"
                    icon={<CarOutlined />}
                    href={selectedClient ? `/dashboard/clients/profile/${selectedClient}/vehicles` : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 13, padding: 0, color: selectedClient ? '#1890ff' : '#aaa', pointerEvents: selectedClient ? 'auto' : 'none', cursor: selectedClient ? 'pointer' : 'not-allowed' }}
                    disabled={!selectedClient}
                  >
                    Associer une voiture à ce client
                  </Button>
                </div>
              </Col>
            </Row>
            <Divider style={{ margin: '0 0 18px 0' }} />
            <Row gutter={16} style={{ marginBottom: 0 }}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item name="imei" label={<span style={{ fontWeight: 600, textAlign: 'left' }}>IMEI</span>} rules={[{ required: true, message: 'Obligatoire' }]}> 
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item name="simNumber" label={<span style={{ fontWeight: 600, textAlign: 'left' }}>Numéro SIM Boitier</span>} rules={[{ required: true, message: 'Obligatoire' }]}> 
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item name="boitierId" label={<span style={{ fontWeight: 600, textAlign: 'left' }}>ID Boitier</span>} rules={[{ required: true, message: 'Obligatoire' }]}> 
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="price"
                  label={<span style={{ fontWeight: 600, textAlign: 'left' }}>Prix</span>}
                  rules={[{ required: true, message: 'Obligatoire' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </Spin>
    </Modal>
  );
};

AddNeotrack.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  initialValues: PropTypes.object,
  error: PropTypes.string,
};

export default AddNeotrack; 