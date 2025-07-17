import React, { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { Row, Col, Skeleton, Table, Input, Spin, message, Button as AntButton } from 'antd';
import qs from 'qs';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';
import clientService from '../../config/api/client.service';

const SocialMediaOverview = lazy(() => import('./overview/index/SocialMediaOverview'));

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
          <Col xs={24} style={{ marginTop: 48 }}>
            <DashboardClientTable />
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default Dashboard;
