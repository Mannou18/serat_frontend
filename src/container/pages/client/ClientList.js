/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Table, Input, Spin, message, Popconfirm, Switch, Space } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import qs from 'qs';
import AddClientForm from './AddClientForm';
import clientService from '../../../config/api/client.service';
import { ProductListWrapper } from '../product/style';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Button } from '../../../components/buttons/buttons';
// import { Tag } from '../../../components/tags/tags';

function ClientList() {
  const [state, setState] = useState({
    searchText: '',
    pagination: {
      current: 1,
      pageSize: 10,
    },
    loading: false,
    clients: [],
    total: 0,
    isAddModalVisible: false,
    isSubmitting: false,
    formResetTrigger: 0,
    deletedFilter: 'notDeleted',
  });

  // Fetch clients from API
  const fetchClients = async (page = 1, pageSize = 10, filters = {}) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const params = {
        page,
        limit: pageSize,
      };
      
      if (filters.deletedFilter && filters.deletedFilter !== 'all') {
        params.isDeleted = filters.deletedFilter === 'deleted';
      }
      
      if (filters.searchText) {
        params.search = filters.searchText;
      }
      
      const queryString = qs.stringify(params);
      const response = await clientService.getAllClientsWithQuery(queryString);
      const clients = Array.isArray(response) ? response : (response.customers || response.data || []);
      const total = response.totalCustomers || (Array.isArray(response) ? response.length : 0);
      const current = response.currentPage || page;
      setState(prev => ({
        ...prev,
        clients,
        total,
        loading: false,
        pagination: {
          ...prev.pagination,
          total,
          current,
        },
      }));
    } catch (error) {
      message.error('Erreur lors du chargement des clients');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // On filter change, fetch with filters
  useEffect(() => {
    fetchClients(1, state.pagination.pageSize, {
      deletedFilter: state.deletedFilter,
      searchText: state.searchText,
    });
  }, [state.deletedFilter, state.searchText]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setState(prev => ({
        ...prev,
        searchText: value,
        pagination: {
          ...prev.pagination,
          current: 1,
        },
      }));
    }, 300),
    []
  );

  const handleSearch = (value) => {
    debouncedSearch(value);
  };

  const handleTableChange = (pagination) => {
    fetchClients(pagination.current, pagination.pageSize, {
      deletedFilter: state.deletedFilter,
      searchText: state.searchText,
    });
  };

  const handleAdd = () => {
    setState(prev => ({ ...prev, isAddModalVisible: true }));
  };

  const handleCancelAdd = () => {
    setState(prev => ({ ...prev, isAddModalVisible: false }));
  };

  const handleSubmitAdd = async (values) => {
    setState(prev => ({ ...prev, isSubmitting: true }));
    try {
      await clientService.addClient(values);
      message.success('Client ajouté avec succès');
      setState(prev => ({
        ...prev,
        isAddModalVisible: false,
        isSubmitting: false,
        formResetTrigger: prev.formResetTrigger + 1,
      }));
      fetchClients();
    } catch (error) {
      message.error(error?.message || 'Erreur lors de l\'ajout du client');
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleDelete = async (id) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await clientService.deleteClient(id);
      message.success('Client supprimé avec succès');
      fetchClients(state.pagination.current, state.pagination.pageSize, {
        deletedFilter: state.deletedFilter,
        searchText: state.searchText,
      });
    } catch (error) {
      message.error('Erreur lors de la suppression du client');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeletedFilter = (value) => {
    setState(prev => ({ ...prev, deletedFilter: value }));
  };

  const handleViewProfile = (client) => {
    // eslint-disable-next-line no-underscore-dangle
    window.location.href = `/dashboard/clients/profile/${client._id}`;
  };

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'fname',
      key: 'fname',
      sorter: (a, b) => a.fname.localeCompare(b.fname),
    },
    {
      title: 'Prénom',
      dataIndex: 'lname',
      key: 'lname',
      sorter: (a, b) => a.lname.localeCompare(b.lname),
    },
    {
      title: 'CIN',
      dataIndex: 'cin',
      key: 'cin',
    },
    {
      title: 'Téléphone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 90,
      render: (text, record) => (
        <Space size={0} direction="horizontal" style={{ display: 'flex', gap: 8 }}>
          <Button
            type="default"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewProfile(record)}
          />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce client ?"
            onConfirm={() => handleDelete(record._id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              type="default"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // No client-side filtering for deleted filter
  const filteredData = state.clients;

  return (
    <ProductListWrapper>
      <PageHeader
        ghost
        title="Liste des clients"
      />
      <Main>
        <Row gutter={15}>
          <Col xs={24}>
            <Cards>
              <div className="search-box" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            
                <Input
                  placeholder="Rechercher des clients..."
                  style={{ width: 220 }}
                  onChange={e => handleSearch(e.target.value)}
                  allowClear
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#343a40' }}>Existants</span>
                  <Switch
                    checked={state.deletedFilter === 'deleted'}
                    onChange={(checked) => handleDeletedFilter(checked ? 'deleted' : 'notDeleted')}
                    style={{ backgroundColor: state.deletedFilter === 'deleted' ? '#b71c1c' : undefined, borderColor: '#b71c1c' }}
                  />
                  <span style={{ color: '#343a40' }}>Supprimés</span>
                </div>
                <Button
                  type="primary"
                  style={{ background: '#b71c1c', borderColor: '#b71c1c', color: '#fff', fontWeight: 600 }}
                  onClick={handleAdd}
                >
                  + Ajouter client
                </Button>
              </div>
              <Spin spinning={state.loading}>
                <Table
                  className="table-responsive"
                  columns={columns}
                  dataSource={filteredData}
                  rowKey="_id"
                  pagination={{
                    ...state.pagination,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} sur ${total} clients`,
                  }}
                  onChange={handleTableChange}
                />
              </Spin>
            </Cards>
          </Col>
        </Row>
      </Main>
      <AddClientForm
        visible={state.isAddModalVisible}
        onCancel={handleCancelAdd}
        onSubmit={handleSubmitAdd}
        loading={state.isSubmitting}
        resetTrigger={state.formResetTrigger}
      />
    </ProductListWrapper>
  );
}

export default ClientList; 