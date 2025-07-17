import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Select, Button, Divider, message, Typography, Card, Space } from 'antd';
import { PlusOutlined, CarOutlined, SearchOutlined, LinkOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import AddCarForm from './AddCarForm';
import carService from '../../../config/api/car.service';

const { Option } = Select;
const { Text } = Typography;

const AddCarModal = ({ visible, onCancel, onSubmit, loading, resetTrigger, clientId }) => {
  const [state, setState] = useState({
    searchText: '',
    cars: [],
    loading: false,
    selectedCar: null,
    showNewCarForm: false,
  });

  // Fetch cars with search
  const fetchCars = async (search = '') => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const queryString = `search=${search}&limit=10&isDeleted=false`;
      const response = await carService.getAllCarsWithQuery(queryString);
      const cars = Array.isArray(response) ? response : (response.cars || response.data || []);
      setState(prev => ({
        ...prev,
        cars,
        loading: false,
      }));
    } catch (error) {
      message.error('Erreur lors du chargement des voitures');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Debounced search function
  const debouncedSearch = debounce((value) => {
    fetchCars(value);
  }, 300);

  // Handle search input change
  const handleSearch = (value) => {
    setState(prev => ({ ...prev, searchText: value }));
    debouncedSearch(value);
  };

  // Handle car selection
  const handleCarSelect = (carId) => {
    const selectedCar = state.cars.find(car => car.id === carId);
    setState(prev => ({ ...prev, selectedCar }));
  };

  // Handle show new car form
  const handleShowNewCarForm = () => {
    setState(prev => ({ ...prev, showNewCarForm: true }));
  };

  // Handle cancel new car form
  const handleCancelNewCarForm = () => {
    setState(prev => ({ ...prev, showNewCarForm: false }));
  };

  // Handle submit new car
  const handleSubmitNewCar = async (values) => {
    try {
      const carData = {
        ...values,
        customerId: clientId,
      };
      await carService.addCar(carData);
      message.success('Voiture ajoutée avec succès');
      onSubmit(carData);
    } catch (error) {
      message.error(error?.message || 'Erreur lors de l\'ajout de la voiture');
    }
  };

  // Handle submit selected car
  const handleSubmitSelectedCar = async () => {
    if (!state.selectedCar) return;
    try {
      const carData = {
        ...state.selectedCar,
        customerId: clientId,
      };
      await carService.updateCar(state.selectedCar.id, carData);
      message.success('Voiture associée avec succès');
      onSubmit(carData);
    } catch (error) {
      message.error(error?.message || 'Erreur lors de l\'association de la voiture');
    }
  };

  // Reset state when modal is closed
  useEffect(() => {
    if (!visible) {
      setState({
        searchText: '',
        cars: [],
        loading: false,
        selectedCar: null,
        showNewCarForm: false,
      });
    } else {
      fetchCars();
    }
  }, [visible]);

  return (
    <Modal
      title={<span><CarOutlined style={{ marginRight: 8 }} />Ajouter une voiture</span>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      {!state.showNewCarForm ? (
        <>
          <Card style={{ marginBottom: 16, background: '#fafbfc', borderRadius: 8, boxShadow: 'none' }} bodyStyle={{ padding: 18 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                showSearch
                style={{ width: '100%' }}
                placeholder={<span><SearchOutlined /> Rechercher une voiture existante...</span>}
                loading={state.loading}
                onSearch={handleSearch}
                onChange={handleCarSelect}
                filterOption={false}
                notFoundContent={state.loading ? 'Chargement...' : 'Aucune voiture trouvée'}
                optionLabelProp="label"
                aria-label="Rechercher une voiture existante"
              >
                {state.cars.map(car => (
                  <Option key={car.id} value={car.id} label={`${car.brand} ${car.model} - ${car.plate_number}`}>
                    <Space>
                      <CarOutlined style={{ color: '#1890ff' }} />
                      <span style={{ fontWeight: 500 }}>{car.brand} {car.model}</span>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {car.plate_number}
                      </Text>
                    </Space>
                  </Option>
                ))}
              </Select>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Sélectionnez une voiture existante ou ajoutez-en une nouvelle.
              </Text>
            </Space>
          </Card>

          {state.selectedCar && (
            <Button 
              type="primary" 
              icon={<LinkOutlined />} 
              onClick={handleSubmitSelectedCar}
              style={{ width: '100%', marginBottom: 18 }}
              loading={loading}
              aria-label="Associer cette voiture"
            >
              Associer cette voiture
            </Button>
          )}

          <Divider plain style={{ color: '#aaa', fontWeight: 500 }}>ou</Divider>

          <Button 
            type="dashed" 
            icon={<PlusOutlined />} 
            onClick={handleShowNewCarForm}
            style={{ width: '100%' }}
            aria-label="Ajouter une nouvelle voiture"
          >
            Ajouter une nouvelle voiture
          </Button>
        </>
      ) : (
        <AddCarForm
          visible
          onCancel={handleCancelNewCarForm}
          onSubmit={handleSubmitNewCar}
          loading={loading}
          resetTrigger={resetTrigger}
          modalTitle="Ajouter une nouvelle voiture"
        />
      )}
    </Modal>
  );
};

AddCarModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  resetTrigger: PropTypes.number.isRequired,
  clientId: PropTypes.string.isRequired,
};

export default AddCarModal; 