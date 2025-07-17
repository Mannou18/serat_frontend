/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Table, message, Modal, Tag } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Cards } from '../../../../../components/cards/frame/cards-frame';
import { Button } from '../../../../../components/buttons/buttons';
import AddCarForm from '../../AddCarForm';
import carService from '../../../../../config/api/car.service';
import clientService from '../../../../../config/api/client.service';
import { ProductListWrapper } from '../../../product/style';

function Vehicles({ clientData: initialClientData }) {
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

  useEffect(() => {
    setClientData(initialClientData);
  }, [initialClientData]);

  const handleEdit = async (record) => {
    try {
      const car = await carService.getCar(record._id);
      const formattedCar = {
        ...car,
        brand: car.brand?.brand_name ? car.brand : { brand_name: car.brand },
        model_name: car.model_name || car.model,
      };
      setState(prev => ({ 
        ...prev, 
        editingCar: formattedCar,
        isEditModalVisible: true 
      }));
    } catch (error) {
      message.error('Erreur lors du chargement de la voiture');
    }
  };

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

  const handleAssociateCar = () => {
    setState(prev => ({
      ...prev,
      isAssociateModalVisible: true,
      editingCar: null,
    }));
  };

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

  const handleDeleteCar = async (carId) => {
    try {
      setState(prev => ({ ...prev, isDeleting: true }));
      await carService.deleteCar(carId);
      message.success('Voiture supprimée avec succès');
      const updatedClientData = await clientService.getClient(clientData._id);
      setClientData(updatedClientData);
    } catch (error) {
      message.error(error?.message || 'Erreur lors de la suppression de la voiture');
    } finally {
      setState(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const carsColumns = [
    {
      title: 'Marque',
      dataIndex: ['brand', 'brand_name'],
      key: 'brand',
      render: (text, record) => record.brand?.brand_name || record.brand || '-',
    },
    {
      title: 'Modèle',
      dataIndex: 'model_name',
      key: 'model',
      render: (model) => {
        const colors = ['#52c41a', '#1890ff', '#ff9800', '#ffe066']; // green, blue, orange, yellow
        // Assign color based on model name hash for variety
        let color = colors[0];
        if (model) {
          const idx = Math.abs(Array.from(model).reduce((acc, c) => acc + c.charCodeAt(0), 0)) % colors.length;
          color = colors[idx];
        }
        return (
          <Tag style={{
            background: color,
            color: color === '#ffe066' ? '#333' : '#fff',
            fontWeight: 600,
            fontSize: 12,
            borderRadius: 3,
            padding: '0 10px',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            border: 'none',
            display: 'inline-block',
          }}>
            {model ? model.toUpperCase() : 'N/A'}
          </Tag>
        );
      },
    },
    {
      title: 'Matricule',
      dataIndex: 'matricule',
      key: 'matricule',
    },
    {
      title: 'Numéro d\'immatriculation',
      dataIndex: 'plate_number',
      key: 'plate_number',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (text, record) => (
        <div className="table-actions">
          <Button
            type="default"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8 }}
          />
          <Button
            type="default"
            danger
            icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
            size="small"
            onClick={() => {
              Modal.confirm({
                title: 'Êtes-vous sûr de vouloir supprimer cette voiture ?',
                content: 'Cette action est irréversible.',
                okText: 'Oui',
                okType: 'danger',
                cancelText: 'Non',
                onOk: () => handleDeleteCar(record._id),
              });
            }}
            loading={state.isDeleting}
          />
        </div>
      ),
    },
  ];

  const carsData = clientData?.cars?.map((car, index) => ({
    key: car._id || index,
    _id: car._id,
    brand: car.brand,
    model_name: car.model_name || car.model,
    matricule: car.matricule,
    plate_number: car.plate_number,
  })) || [];

  return (
    <Row gutter={25}>
      <Col xxl={24} lg={24} md={24} sm={24} xs={24}>
            <Cards headless>
          <Row gutter={16} align="middle" style={{ marginBottom: 24, justifyContent: 'flex-end', display: 'flex' }}>
            <Col span={24} style={{ marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontWeight: 600 }}>Voitures Associées</h2>
          </Col>
            <Col>
              <Button
                type="primary"
                size="default"
                style={{
                  background: '#b71c1c',
                  borderColor: '#b71c1c',
                  color: 'white',
                  height: 32,
                  fontWeight: 600,
                  fontSize: 13,
                  padding: '0 14px',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClick={handleAssociateCar}
              >
                <FeatherIcon icon="plus" size={13} style={{ marginRight: 6 }} /> Associer une voiture
              </Button>
            </Col>
        </Row>
          <ProductListWrapper>
            <Table
              className="table-responsive"
              pagination={false}
              dataSource={carsData}
              columns={carsColumns}
              locale={{ emptyText: 'Aucune voiture associée' }}
              loading={state.loading}
            />
          </ProductListWrapper>
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

Vehicles.propTypes = {
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

export default Vehicles; 