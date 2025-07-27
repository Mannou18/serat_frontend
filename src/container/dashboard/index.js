import React, { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { Row, Col, Skeleton, Table, Input, Spin, message, Button as AntButton, Tag, Statistic, Space } from 'antd';
import { CalendarOutlined, ExclamationCircleOutlined, ClockCircleOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import qs from 'qs';
import moment from 'moment';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';
import clientService from '../../config/api/client.service';
import installmentService from '../../config/api/installment.service';

const SocialMediaOverview = lazy(() => import('./overview/index/SocialMediaOverview'));

// New component for upcoming installments
function UpcomingInstallments() {
  const [upcomingData, setUpcomingData] = useState({ customers: [], stats: {} });
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [apiStatus, setApiStatus] = useState('available'); // 'available', 'demo', 'error'

  const fetchUpcomingInstallments = useCallback(async (page = 1, pageSize = 20, daysAhead = 30) => {
    setLoading(true);
    try {
      const data = await installmentService.getUpcomingInstallments({ page, limit: pageSize, daysAhead });
      setUpcomingData(data);
      setPagination(prev => ({ ...prev, total: data.stats?.totalCustomers || 0 }));
    } catch (error) {
      console.error('Error fetching upcoming installments:', error);
      
      // Show fallback data when API is not available
      if (error.response?.status === 404) {
        message.warning('API des échéances à venir non disponible. Affichage des données de démonstration.');
        setApiStatus('demo');
        const fallbackData = {
          customers: [
            {
              customer: {
                _id: 'demo-customer-1',
                name: 'Ahmed Ben Ali',
                phoneNumber: '0123456789',
                cin: '12345678'
              },
              upcomingInstallments: [
                {
                  _id: 'demo-installment-1',
                  installment: {
                    amount: 500,
                    dueDate: moment().add(2, 'days').toISOString(),
                    status: 'pending',
                    daysUntilDue: 2
                  }
                }
              ],
              totalUpcomingAmount: 500,
              overdueCount: 0,
              pendingCount: 1
            },
            {
              customer: {
                _id: 'demo-customer-2',
                name: 'Fatma Ben Salem',
                phoneNumber: '0987654321',
                cin: '87654321'
              },
              upcomingInstallments: [
                {
                  _id: 'demo-installment-2',
                  installment: {
                    amount: 750,
                    dueDate: moment().subtract(1, 'days').toISOString(),
                    status: 'overdue',
                    daysUntilDue: -1
                  }
                }
              ],
              totalUpcomingAmount: 750,
              overdueCount: 1,
              pendingCount: 0
            }
          ],
          stats: {
            totalCustomers: 2,
            totalUpcomingAmount: 1250,
            totalOverdueCount: 1,
            totalPendingCount: 1,
            daysAhead: 30
          }
        };
        setUpcomingData(fallbackData);
        setPagination(prev => ({ ...prev, total: 2 }));
      } else {
        setApiStatus('error');
        message.error('Erreur lors du chargement des échéances à venir');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcomingInstallments(pagination.current, pagination.pageSize);
  }, [fetchUpcomingInstallments, pagination.current, pagination.pageSize]);

  const handleTableChange = (pag) => {
    setPagination(prev => ({ ...prev, current: pag.current, pageSize: pag.pageSize }));
  };

  const getStatusColor = (status, daysUntilDue) => {
    if (status === 'overdue' || daysUntilDue < 0) return '#e74c3c';
    if (daysUntilDue <= 3) return '#f39c12';
    return '#27ae60';
  };

  const getStatusText = (status, daysUntilDue) => {
    if (status === 'overdue' || daysUntilDue < 0) return 'EN RETARD';
    if (daysUntilDue <= 3) return 'URGENT';
    if (daysUntilDue <= 7) return 'PROCHE';
    return 'NORMAL';
  };

  const columns = [
    {
      title: 'Client',
      key: 'customer',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {record.customer.name}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.customer.phoneNumber}
          </div>
          <div style={{ fontSize: '11px', color: '#999' }}>
            CIN: {record.customer.cin}
          </div>
        </div>
      ),
    },
    {
      title: 'Échéances à venir',
      key: 'installments',
      render: (_, record) => (
        <div>
          {record.upcomingInstallments.map((inst, index) => (
            <div key={inst._id} style={{ // eslint-disable-line no-underscore-dangle
              marginBottom: index < record.upcomingInstallments.length - 1 ? 8 : 0,
              padding: '8px',
              backgroundColor: 'white',
              borderRadius: '3px',
              border: '1px solid #f0f0f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {typeof inst.installment.amount === 'object' 
                    ? (inst.installment.amount.$numberDecimal || inst.installment.amount || 0).toLocaleString('fr-FR')
                    : (inst.installment.amount || 0).toLocaleString('fr-FR')
                  } DT
                </span>
                <Tag 
                  style={{ 
                    fontSize: '10px', 
                    fontWeight: 'bold',
                    backgroundColor: getStatusColor(inst.installment.status, inst.installment.daysUntilDue),
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '2px 6px'
                  }}
                >
                  {getStatusText(inst.installment.status, inst.installment.daysUntilDue)}
                </Tag>
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Échéance: {moment(inst.installment.dueDate).format('DD/MM/YYYY')}
                {inst.installment.daysUntilDue > 0 && (
                  <span style={{ marginLeft: 8, color: '#1890ff' }}>
                    (dans {inst.installment.daysUntilDue} jours)
                  </span>
                )}
                {inst.installment.daysUntilDue < 0 && (
                  <span style={{ marginLeft: 8, color: '#ff4d4f' }}>
                    (en retard de {Math.abs(inst.installment.daysUntilDue)} jours)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Résumé',
      key: 'summary',
      width: 150,
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 8 }}>
            <Statistic
              title="Total à payer"
              value={typeof record.totalUpcomingAmount === 'object' 
                ? parseFloat(record.totalUpcomingAmount.$numberDecimal || record.totalUpcomingAmount || 0)
                : parseFloat(record.totalUpcomingAmount || 0)
              }
              precision={2}
              valueStyle={{ color: '#2c3e50', fontSize: '16px', fontWeight: 'bold' }}
              suffix="DT"
            />
          </div>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {record.overdueCount > 0 && (
              <Tag 
                icon={<ExclamationCircleOutlined />} 
                style={{ 
                  fontWeight: 'bold',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '2px 6px',
                  fontSize: '10px'
                }}
              >
                {record.overdueCount} en retard
              </Tag>
            )}
            {record.pendingCount > 0 && (
              <Tag 
                icon={<ClockCircleOutlined />} 
                style={{ 
                  fontWeight: 'bold',
                  backgroundColor: '#f39c12',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '2px 6px',
                  fontSize: '10px'
                }}
              >
                {record.pendingCount} en attente
              </Tag>
            )}
          </Space>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <AntButton
          type="primary"
          size="small"
          style={{ 
            fontWeight: 600, 
            minWidth: 100,
            backgroundColor: '#3498db',
            borderColor: '#3498db'
          }}
          onClick={() => { window.location.href = `/dashboard/clients/profile/${record.customer._id}`; }} // eslint-disable-line no-underscore-dangle
        >
          Voir client
        </AntButton>
      ),
    },
  ];

  return (
    <Cards headless style={{ padding: 0 }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #3a4a5c 100%)',
        padding: '20px',
        borderRadius: '8px 8px 0 0',
        color: 'white',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <CalendarOutlined style={{ fontSize: '20px', marginRight: 10, color: '#ecf0f1' }} />
          <h2 style={{ margin: 0, fontWeight: 500, fontSize: 18, color: 'white' }}>Échéances à venir</h2>
          {apiStatus === 'demo' && (
            <Tag color="warning" style={{ marginLeft: 10, fontSize: '10px', fontWeight: 'bold' }}>
              Mode Démo
            </Tag>
          )}
          {apiStatus === 'error' && (
            <Tag color="error" style={{ marginLeft: 10, fontSize: '10px', fontWeight: 'bold' }}>
              Erreur API
            </Tag>
          )}
        </div>
        <Row gutter={12}>
          <Col span={6}>
            <Statistic
              title="Clients concernés"
              value={upcomingData.stats?.totalCustomers || 0}
              valueStyle={{ color: '#ecf0f1', fontSize: '16px', fontWeight: 'bold' }}
              titleStyle={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Montant total"
              value={upcomingData.stats?.totalUpcomingAmount || 0}
              precision={2}
              valueStyle={{ color: '#ecf0f1', fontSize: '16px', fontWeight: 'bold' }}
              titleStyle={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}
              suffix="DT"
              prefix={<DollarOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="En retard"
              value={upcomingData.stats?.totalOverdueCount || 0}
              valueStyle={{ color: '#ecf0f1', fontSize: '16px', fontWeight: 'bold' }}
              titleStyle={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="En attente"
              value={upcomingData.stats?.totalPendingCount || 0}
              valueStyle={{ color: '#ecf0f1', fontSize: '16px', fontWeight: 'bold' }}
              titleStyle={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
        </Row>
      </div>
      
      <Spin spinning={loading}>
        <Table
          className="table-responsive upcoming-installments-table"
          columns={columns}
          dataSource={upcomingData.customers}
          rowKey={(record) => record.customer._id} // eslint-disable-line no-underscore-dangle
          pagination={{
            ...pagination,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} clients`,
          }}
          onChange={handleTableChange}
          locale={{
            emptyText: loading ? 'Chargement...' : 'Aucune échéance à venir',
          }}
          style={{ 
            backgroundColor: 'white',
            borderRadius: '0 0 8px 8px',
            border: '1px solid #e8e8e8'
          }}
        />
      </Spin>
    </Cards>
  );
}

function DashboardClientTable() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchClients = useCallback(async (page = 1, pageSize = 10, search = '') => {
    setLoading(true);
    try {
      const params = { page, limit: pageSize };
      if (search) params.search = search;
      const queryString = qs.stringify(params);
      const response = await clientService.getAllClientsWithQuery(queryString);
      // Extract data and pagination info
      const data = Array.isArray(response) ? response : (response.customers || response.data || []);
      const total = response.totalCustomers || (Array.isArray(response) ? response.length : 0);
      const current = response.currentPage || page;
      setClients(data);
      setPagination(prev => ({ ...prev, total, current }));
    } catch (error) {
      message.error('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients(pagination.current, pagination.pageSize, searchText);
  }, [fetchClients, pagination.current, pagination.pageSize, searchText]);

  const handleTableChange = (pag) => {
    setPagination(prev => ({ ...prev, current: pag.current, pageSize: pag.pageSize }));
  };

  const columns = [
    { title: 'Nom', dataIndex: 'fname', key: 'fname' },
    { title: 'Prénom', dataIndex: 'lname', key: 'lname' },
    { title: 'CIN', dataIndex: 'cin', key: 'cin' },
    { title: 'Téléphone', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (text, record) => (
        <AntButton
          type="primary"
          size="small"
          style={{ fontWeight: 600, minWidth: 100 }}
          // eslint-disable-next-line no-underscore-dangle
          onClick={() => { window.location.href = `/dashboard/clients/profile/${record._id}`; }}
        >
          Voir client
        </AntButton>
      ),
    },
  ];

  return (
    <Cards headless style={{ padding: 0 }}>
      <h2 style={{ margin: '0 0 24px 24px', fontWeight: 700, fontSize: 24, letterSpacing: 0.5 }}>Liste des clients</h2>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, marginBottom: 16, marginRight: 24 }}>
        <Input
          placeholder="Rechercher des clients..."
          style={{ width: 220 }}
          onChange={e => setSearchText(e.target.value)}
          allowClear
        />
      </div>
      <Spin spinning={loading}>
        <Table
          className="table-responsive dashboard-client-table"
          columns={columns}
          dataSource={clients}
          rowKey="_id"
          pagination={{
            ...pagination,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} clients`,
          }}
          onChange={handleTableChange}
        />
      </Spin>
    </Cards>
  );
}

function Dashboard() {
  return (
    <>
      <PageHeader
        ghost
        title="Serat Page d'accueil"
        // Removed buttons prop to hide Add New, Calendar, Export, and Share buttons
      />
      <Main>
        <Row justify="center" gutter={25}>
          <Col xs={24}>
            <Suspense
              fallback={
                <Cards headless>
                  <Skeleton active />
                </Cards>
              }
            >
              <SocialMediaOverview />
            </Suspense>
          </Col>
          <Col xs={24} style={{ marginTop: 24 }}>
            <UpcomingInstallments />
          </Col>
          <Col xs={24} style={{ marginTop: 24 }}>
            <DashboardClientTable />
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default Dashboard;
