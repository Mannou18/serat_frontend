/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, message } from 'antd';
import CountUp from 'react-countup';
import { Cards } from '../../../../../components/cards/frame/cards-frame';
import Heading from '../../../../../components/heading/heading';
import AddCarForm from '../../AddCarForm';
import carService from '../../../../../config/api/car.service';
import clientService from '../../../../../config/api/client.service';
import axios from '../../../../../config/api/axios.config';
// eslint-disable-next-line import/extensions
// import { ProductListWrapper } from '../../../product/style'; // Removed unused import

function Overview({ clientData: initialClientData }) {
  const [state, setState] = useState({
    isEditModalVisible: false,
    isAssociateModalVisible: false,
    editingCar: null,
    isEditSubmitting: false,
    isAssociateSubmitting: false,
    loading: false,
    isDeleting: false,
  });
  const [clientData, setClientData] = useState(initialClientData);
  const [stats, setStats] = useState({
    cars: 0,
    cashPurchases: 0,
    facilitatedPurchases: 0,
    debts: 0,
    services: 0,
    neotracks: 0,
  });

  // Update clientData when initialClientData changes
  useEffect(() => {
    setClientData(initialClientData);
  }, [initialClientData]);

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      if (!initialClientData?._id) return;
      try {
        const response = await axios.get(`/stats/client/${initialClientData._id}`);
        setStats({
          cars: response.data.voitures ?? 0,
          cashPurchases: response.data.achatsComptants ? (response.data.achatsComptants.$numberDecimal || response.data.achatsComptants) : 0,
          facilitatedPurchases: response.data.achatsFacilites ? (response.data.achatsFacilites.$numberDecimal || response.data.achatsFacilites) : 0,
          debts: response.data.dettes ? (response.data.dettes.$numberDecimal || response.data.dettes) : 0,
          services: response.data.services ?? 0,
          neotracks: response.data.neotracks ?? 0,
        });
      } catch (error) {
        setStats({ cars: 0, cashPurchases: 0, facilitatedPurchases: 0, debts: 0 });
      }
    };
    fetchStats();
  }, [initialClientData?._id]);

  // Removed handleEdit and handleDeleteCar as they are no longer used

  const handleCancelEdit = () => {
    setState(prev => ({
      ...prev,
      isEditModalVisible: false,
      editingCar: null,
    }));
  };

  const handleSubmitEdit = async (values) => {
    if (!state.editingCar) return;
    setState(prev => ({ ...prev, isEditSubmitting: true }));
    try {
      const carId = state.editingCar._id;
      const formattedValues = {
        ...values,
        brand: typeof values.brand === 'string' ? values.brand : values.brand._id,
      };
      await carService.updateCar(carId, formattedValues);
      message.success('Voiture mise à jour avec succès');
      const updatedClientData = await clientService.getClient(clientData._id);
      setClientData(updatedClientData);
      setState(prev => ({
        ...prev,
        isEditModalVisible: false,
        editingCar: null,
        isEditSubmitting: false,
      }));
    } catch (error) {
      message.error(error?.message || 'Erreur lors de la mise à jour de la voiture');
      setState(prev => ({ ...prev, isEditSubmitting: false }));
    }
  };

  // Removed handleAssociateCar and carsColumns as they are no longer used

  const handleCancelAssociate = () => {
    setState(prev => ({
      ...prev,
      isAssociateModalVisible: false,
    }));
  };

  const handleSubmitAssociate = async (values) => {
    setState(prev => ({ ...prev, isAssociateSubmitting: true }));
    try {
      const formattedValues = {
        ...values,
        brand: typeof values.brand === 'string' ? values.brand : values.brand._id,
      };
      const addedCar = await carService.addCar(formattedValues);
      await carService.associateCar(addedCar._id, clientData._id);
      message.success('Voiture associée avec succès');
      const updatedClientData = await clientService.getClient(clientData._id);
      setClientData(updatedClientData);
      setState(prev => ({
        ...prev,
        isAssociateModalVisible: false,
        isAssociateSubmitting: false,
      }));
    } catch (error) {
      message.error(error?.message || 'Erreur lors de l\'association de la voiture');
      setState(prev => ({ ...prev, isAssociateSubmitting: false }));
    }
  };

  // Transform cars data to include key for table
  const carsData = clientData?.cars?.map((car, index) => ({
    key: car._id || index,
    _id: car._id,
    brand: car.brand, // Keep the entire brand object
    model_name: car.model_name || car.model,
    matricule: car.matricule,
    plate_number: car.plate_number,
  })) || [];
  
  console.log('Overview component - transformed carsData:', carsData);

  return (
    <Row gutter={25}>
      <Col xxl={24} lg={24} md={24} sm={24} xs={24}>
        <Cards headless>
          <div className="card-chunk">
            <Heading as="h4">Statistiques client</Heading>
            <Row gutter={[15, 15]} style={{ marginTop: 15 }}>
              <Col span={6}>
                <Cards headless style={{ textAlign: 'center', padding: '20px 10px' }}>
                  <Heading as="h1"><CountUp end={Number(stats.services) || 0} duration={1.2} /></Heading>
                  <p>Services</p>
                </Cards>
              </Col>
              <Col span={6}>
                <Cards headless style={{ textAlign: 'center', padding: '20px 10px' }}>
                  <Heading as="h1"><CountUp end={Number(stats.neotracks) || 0} duration={1.2} /></Heading>
                  <p>Neotracks</p>
                </Cards>
              </Col>
              <Col span={6}>
                <Cards headless style={{ textAlign: 'center', padding: '20px 10px' }}>
                  <Heading as="h1"><CountUp end={Number(stats.cashPurchases) || 0} duration={1.2} /></Heading>
                  <p>Achats Comptants</p>
                </Cards>
              </Col>
              <Col span={6}>
                <Cards headless style={{ textAlign: 'center', padding: '20px 10px' }}>
                  <Heading as="h1"><CountUp end={Number(stats.cars) || 0} duration={1.2} /></Heading>
                  <p>Voitures</p>
                </Cards>
              </Col>
            </Row>
          </div>
        </Cards>
      </Col>
   
      <AddCarForm
        visible={state.isEditModalVisible || state.isAssociateModalVisible}
        onCancel={state.isEditModalVisible ? handleCancelEdit : handleCancelAssociate}
        onSubmit={state.isEditModalVisible ? handleSubmitEdit : handleSubmitAssociate}
        loading={state.isEditSubmitting || state.isAssociateSubmitting}
        resetTrigger={state.isAssociateModalVisible ? 1 : 0}
        initialValues={state.editingCar ? {
          brand: state.editingCar.brand?._id || state.editingCar.brand,
          model_name: state.editingCar.model_name || state.editingCar.model,
          matricule: state.editingCar.matricule,
          plate_number: state.editingCar.plate_number,
        } : {}}
        modalTitle={state.isEditModalVisible 
          ? (state.editingCar ? `${state.editingCar.brand?.brand_name || state.editingCar.brand} ${state.editingCar.model_name || state.editingCar.model}` : 'Modifier une voiture')
          : 'Associer une voiture'
        }
        okText={state.isEditModalVisible ? "Mettre à jour" : "Associer"}
      />
    </Row>
  );
}

Overview.propTypes = {
  clientData: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    cars: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        model: PropTypes.string,
        brand: PropTypes.string,
        matricule: PropTypes.string,
        plate_number: PropTypes.string,
      })
    ),
  }),
};

Overview.defaultProps = {
  clientData: {
    cars: [],
  },
};

export default Overview; 