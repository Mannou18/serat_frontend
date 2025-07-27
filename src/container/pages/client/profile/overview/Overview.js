/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, message, Table, Tag, Statistic, Spin } from 'antd';
import CountUp from 'react-countup';
import { CalendarOutlined, ExclamationCircleOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { Cards } from '../../../../../components/cards/frame/cards-frame';
import Heading from '../../../../../components/heading/heading';
import AddCarForm from '../../AddCarForm';
import carService from '../../../../../config/api/car.service';
import clientService from '../../../../../config/api/client.service';
import installmentService from '../../../../../config/api/installment.service';
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

  // Add state for upcoming installments
  const [upcomingInstallments, setUpcomingInstallments] = useState({
    customer: null,
    upcomingInstallments: [
      {
        _id: "demo_1",
        venteId: "demo_vente_1",
        installmentIndex: 0,
        venteInfo: {
          totalAmount: 220,
          paymentType: "facilite",
          createdAt: "2025-07-26T11:38:47.851Z",
          articles: [{ product: "Afficheur", quantity: 6, totalPrice: { $numberDecimal: "120" } }],
          services: [{ service: "Service", cost: { $numberDecimal: "100" } }]
        },
        installment: {
          amount: { $numberDecimal: "15" },
          dueDate: "2025-07-29T00:00:00.000Z",
          status: "pending",
          daysUntilDue: 2
        }
      },
      {
        _id: "demo_2",
        venteId: "demo_vente_1",
        installmentIndex: 1,
        venteInfo: {
          totalAmount: 220,
          paymentType: "facilite",
          createdAt: "2025-07-26T11:38:47.851Z",
          articles: [{ product: "Afficheur", quantity: 6, totalPrice: { $numberDecimal: "120" } }],
          services: [{ service: "Service", cost: { $numberDecimal: "100" } }]
        },
        installment: {
          amount: { $numberDecimal: "50" },
          dueDate: "2025-08-09T00:00:00.000Z",
          status: "pending",
          daysUntilDue: 13
        }
      }
    ],
    stats: {
      totalInstallments: 2,
      totalUpcomingAmount: "65.00",
      overdueCount: 0,
      pendingCount: 2,
    }
  });
  const [installmentsLoading, setInstallmentsLoading] = useState(false);

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

  // Fetch upcoming installments for the client
  useEffect(() => {
    const fetchUpcomingInstallments = async () => {
      if (!initialClientData?._id) {
        console.log('initialClientData._id is not available, keeping demo data');
        return;
      }
      setInstallmentsLoading(true);
      try {
        console.log('Fetching upcoming installments for client:', initialClientData._id);
        
        // Test direct API call first
        try {
          const testResponse = await axios.get(`/installments/client/${initialClientData._id}/upcoming?daysAhead=30`);
          console.log('Direct API test successful:', testResponse.data);
        } catch (testError) {
          console.log('Direct API test failed:', testError.response?.status, testError.response?.data);
        }
        
        const data = await installmentService.getCustomerUpcomingInstallments(initialClientData._id);
        console.log('Upcoming installments data received:', data);
        
        // Only update if we got real data
        if (data && data.upcomingInstallments && data.upcomingInstallments.length > 0) {
          setUpcomingInstallments(data);
          console.log('Updated with real data, demo mode disabled');
        } else {
          console.log('No real data received, keeping demo data');
        }
      } catch (error) {
        console.error('Error fetching upcoming installments:', error);
        console.log('API failed, keeping demo data');
      } finally {
        setInstallmentsLoading(false);
      }
    };
    fetchUpcomingInstallments();
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
  console.log('Overview component - upcomingInstallments:', upcomingInstallments);
  console.log('Overview component - installmentsLoading:', installmentsLoading);

  // Helper functions for installments
  const getStatusColor = (status, daysUntilDue) => {
    if (status === 'overdue' || daysUntilDue < 0) return '#ff4d4f';
    if (daysUntilDue <= 3) return '#fa8c16';
    return '#52c41a';
  };

  const getStatusText = (status, daysUntilDue) => {
    if (status === 'overdue' || daysUntilDue < 0) return 'EN RETARD';
    if (daysUntilDue <= 3) return 'URGENT';
    return 'NORMAL';
  };

  // Installments table columns
  const installmentsColumns = [
    {
      title: 'Échéance',
      key: 'installment',
      width: 200,
      render: (_, record) => (
        <div style={{ padding: '12px', backgroundColor: '#fafafa', borderRadius: '4px', border: '1px solid #e8e8e8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '14px' }}>
              {typeof record.installment.amount === 'object' 
                ? (record.installment.amount.$numberDecimal || record.installment.amount || 0).toLocaleString('fr-FR')
                : (record.installment.amount || 0).toLocaleString('fr-FR')
              } DT
            </span>
            <Tag 
              style={{ 
                backgroundColor: getStatusColor(record.installment.status, record.installment.daysUntilDue),
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: 'bold'
              }}
            >
              {getStatusText(record.installment.status, record.installment.daysUntilDue)}
            </Tag>
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            Échéance: {new Date(record.installment.dueDate).toLocaleDateString('fr-FR')} 
            {record.installment.daysUntilDue > 0 
              ? ` (dans ${record.installment.daysUntilDue} jours)`
              : record.installment.daysUntilDue < 0 
                ? ` (en retard de ${Math.abs(record.installment.daysUntilDue)} jours)`
                : ' (aujourd\'hui)'
            }
          </div>
        </div>
      ),
    },
    {
      title: 'Vente Info',
      key: 'venteInfo',
      width: 300,
      render: (_, record) => (
        <div style={{ padding: '8px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#333' }}>
            Vente #{record.venteId.slice(-8)}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            <div>Total: {record.venteInfo.totalAmount} DT</div>
            <div>Type: {record.venteInfo.paymentType === 'facilite' ? 'Facilité' : 'Comptant'}</div>
            <div>Date: {new Date(record.venteInfo.createdAt).toLocaleDateString('fr-FR')}</div>
          </div>
        </div>
      ),
    },
  ];

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

      {/* Échéances à venir Section */}
      <Col xxl={24} lg={24} md={24} sm={24} xs={24} style={{ marginTop: 25 }}>
        <Cards headless>
          <div className="card-chunk">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <CalendarOutlined style={{ fontSize: '18px', marginRight: 8, color: '#1890ff' }} />
              <Heading as="h4" style={{ margin: 0 }}>Échéances à venir</Heading>
              {installmentsLoading && (
                <Tag color="processing" style={{ marginLeft: 10, fontSize: '10px', fontWeight: 'bold' }}>
                  Chargement...
                </Tag>
              )}
            </div>
            
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Cards headless style={{ textAlign: 'center', padding: '12px 8px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <Statistic
                    title="Total échéances"
                    value={upcomingInstallments.stats.totalInstallments}
                    valueStyle={{ color: '#1890ff', fontSize: '18px', fontWeight: 'bold' }}
                    titleStyle={{ color: '#666', fontSize: '12px' }}
                  />
                </Cards>
              </Col>
              <Col span={6}>
                <Cards headless style={{ textAlign: 'center', padding: '12px 8px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <Statistic
                    title="Montant total"
                    value={upcomingInstallments.stats.totalUpcomingAmount}
                    precision={2}
                    valueStyle={{ color: '#52c41a', fontSize: '18px', fontWeight: 'bold' }}
                    titleStyle={{ color: '#666', fontSize: '12px' }}
                    suffix="DT"
                    prefix={<DollarOutlined />}
                  />
                </Cards>
              </Col>
              <Col span={6}>
                <Cards headless style={{ textAlign: 'center', padding: '12px 8px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <Statistic
                    title="En retard"
                    value={upcomingInstallments.stats.overdueCount}
                    valueStyle={{ color: '#ff4d4f', fontSize: '18px', fontWeight: 'bold' }}
                    titleStyle={{ color: '#666', fontSize: '12px' }}
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Cards>
              </Col>
              <Col span={6}>
                <Cards headless style={{ textAlign: 'center', padding: '12px 8px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <Statistic
                    title="En attente"
                    value={upcomingInstallments.stats.pendingCount}
                    valueStyle={{ color: '#fa8c16', fontSize: '18px', fontWeight: 'bold' }}
                    titleStyle={{ color: '#666', fontSize: '12px' }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Cards>
              </Col>
            </Row>
            
            <Spin spinning={installmentsLoading}>
              <Table
                columns={installmentsColumns}
                dataSource={upcomingInstallments.upcomingInstallments}
                rowKey={(record) => record._id}
                pagination={false}
                locale={{
                  emptyText: installmentsLoading ? 'Chargement...' : 'Aucune échéance à venir pour ce client',
                }}
                style={{ 
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid #f0f0f0'
                }}
              />
            </Spin>
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