import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Modal, message, Tag, Tooltip, Input, Row, Switch, Col, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import moment from 'moment';
import qs from 'qs';
import AddServiceForm from './AddServiceForm';

import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';

import serviceService from '../../../config/api/service.service';
import clientService from '../../../config/api/client.service';
import carBrandService from '../../../config/api/carBrand.service';

/* eslint-disable no-underscore-dangle */

const ServicesList = () => {
  const [state, setState] = useState({
    services: [],
    loading: false,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    customers: [],
  });
  const [brands, setBrands] = useState([]);

  const [searchText, setSearchText] = useState('');
  const [deletedFilter, setDeletedFilter] = useState('notDeleted');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Fetch services data
  const fetchServices = useCallback(async (page = 1, pageSize = 10, filters = {}) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const queryParams = {
        page,
        limit: pageSize,
        ...filters,
      };
      if (filters.deletedFilter && filters.deletedFilter !== 'all') {
        queryParams.isDeleted = filters.deletedFilter === 'deleted';
      }
      if (filters.searchText) {
        queryParams.search = filters.searchText;
      }
      const response = await serviceService.getAllServicesWithQuery(qs.stringify(queryParams));
      setState(prev => ({
        ...prev,
        services: response.services || response.data || [],
        pagination: {
          ...prev.pagination,
          current: page,
          pageSize,
          total: response.pagination?.totalRecords || response.totalServices || response.total || 0,
        },
        loading: false,
      }));
    } catch (error) {
      message.error('Erreur lors du chargement des services');
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Fetch customers for select
  const fetchCustomers = useCallback(async () => {
    try {
      const customersResponse = await clientService.getAllClients(1, 1000);
      setState(prev => ({
        ...prev,
        customers: customersResponse.customers || customersResponse.data || [],
      }));
    } catch (error) {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchServices();
    fetchCustomers();
    // Fetch all brands for the AddServiceForm
    carBrandService.getAllBrandsWithQuery('page=1&limit=1000').then(res => {
      setBrands(res.carBrands || res.data || []);
    });
  }, [fetchServices, fetchCustomers]);

  const handleTableChange = (pagination) => {
    fetchServices(pagination.current, pagination.pageSize, { searchText, deletedFilter });
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
    fetchServices(1, state.pagination.pageSize, { searchText: e.target.value, deletedFilter });
  };

  const handleSearchEnter = () => {
    fetchServices(1, state.pagination.pageSize, { searchText, deletedFilter });
  };

  const handleDeletedFilter = (checked) => {
    const value = checked ? 'notDeleted' : 'deleted';
    setDeletedFilter(value);
    fetchServices(1, state.pagination.pageSize, { searchText, deletedFilter: value });
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Supprimer ce service ?',
      onOk: async () => {
        try {
          await serviceService.deleteService(id);
          message.success('Service supprimé');
          fetchServices();
        } catch (error) {
          message.error("Erreur lors de la suppression");
        }
      }
    });
  };

  const handleEdit = async (serviceId) => {
    try {
      const service = await serviceService.getService(serviceId);
      setEditingService(service);
      setIsAddModalVisible(true);
    } catch (error) {
      message.error("Erreur lors du chargement du service");
    }
  };

  const columns = [
    {
      title: 'Client',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer) => customer?.fname || customer?.name || customer?.fullName || 'N/A',
    },
    {
      title: 'Type de Service',
      dataIndex: 'serviceType',
      key: 'serviceType',
      render: (type) => {
        let color = 'default';
        switch (type) {
          case 'repair': color = '#b71c1c'; break; // red
          case 'maintenance': color = '#1890ff'; break; // blue
          case 'inspection': color = '#9c27b0'; break; // purple
          case 'installation': color = '#43a047'; break; // green
          case 'other': color = '#bfbfbf'; break; // gray
          default: color = '#bfbfbf';
        }
        // Map backend value to French label
        const labelMap = {
          repair: 'RÉPARATION',
          maintenance: 'ENTRETIEN',
          inspection: 'CONTRÔLE TECHNIQUE',
          installation: 'INSTALLATION',
          other: 'AUTRE',
        };
        return (
          <Tag style={{
            background: color,
            color: '#fff',
            fontWeight: 600,
            fontSize: 12,
            borderRadius: 3,
            padding: '0 10px',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            border: 'none',
            display: 'inline-block',
          }}>
            {labelMap[type] || type?.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description) => (
        <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {description}
        </div>
      ),
    },
    {
      title: 'Prix',
      dataIndex: 'estimatedCost',
      key: 'estimatedCost',
      render: (price) => {
        let num = price;
        if (price && typeof price === 'object' && price.$numberDecimal) num = parseFloat(price.$numberDecimal);
        if (typeof num === 'string') num = parseFloat(num);
        if (typeof num === 'number' && !Number.isNaN(num)) {
          return (
            <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
              {num.toLocaleString('fr-FR')} DT
            </span>
          );
        }
        return '-';
      }
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let label = status ? status.replace('_', ' ').toUpperCase() : 'N/A';
        let style = { fontWeight: 500, fontSize: 12, borderRadius: 3, padding: '0 8px', lineHeight: '22px', height: 22, display: 'inline-block', letterSpacing: 0.5 };
        if (status === 'in_progress' || status === 'en_cours') {
          style = { ...style, background: '#ff9800', color: '#fff', border: 'none' };
        } else if (status === 'pending' || status === 'en_attente') {
          style = { ...style, background: '#1890ff', color: '#fff', border: 'none' };
        } else if (status === 'completed' || status === 'terminé') {
          style = { ...style, background: '#52c41a', color: '#fff', border: 'none' };
        } else if (!status) {
          style = { ...style, background: '#f0f0f0', color: '#333', border: '1px solid #d9d9d9' };
          label = 'N/A';
        } else if (status === 'cancelled' || status === 'annulé') {
          style = { ...style, background: '#b71c1c', color: '#fff', border: 'none' };
        } else {
          style = { ...style, background: '#bfbfbf', color: '#fff', border: 'none' };
        }
        return (
          <Tag style={style}>{label}</Tag>
        );
      },
    },
    {
      title: 'Date de Création',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? moment(date).format('DD/MM/YYYY HH:mm') : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Tooltip title="Modifier">
            <Button
              type="default"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record._id || record.id)}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button
              type="default"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(record._id || record.id)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  // after fetching services from backend, filter them client-side if needed
  const filteredServices = useMemo(() => {
    let data = state.services;
    // Filter by deleted status
    if (deletedFilter === 'deleted') {
      data = data.filter(service => service.isDeleted);
    } else if (deletedFilter === 'notDeleted') {
      data = data.filter(service => !service.isDeleted);
    }
    // Filter by searchText
    if (searchText) {
      const search = searchText.toLowerCase();
      data = data.filter(service => {
        if (String(service.price).toLowerCase().includes(search)) return true;
        if (service.customer && `${service.customer.fname || ''} ${service.customer.lname || ''}`.toLowerCase().includes(search)) return true;
        if ((service.reference || '').toLowerCase().includes(search)) return true;
        if ((service.serviceType || '').toLowerCase().includes(search)) return true;
        if ((service.description || '').toLowerCase().includes(search)) return true;
        return false;
      });
    }
    return data;
  }, [state.services, searchText, deletedFilter]);

  const handleAdd = () => {
    setIsAddModalVisible(true);
    setEditingService(null);
  };

  const handleSubmitAdd = async (values) => {
    setIsSubmitting(true);
    try {
      const payload = { ...values };
      await serviceService.addService(payload);
      message.success('Service ajouté avec succès');
      setIsAddModalVisible(false);
      setIsSubmitting(false);
      fetchServices();
    } catch (error) {
      message.error(error?.message || "Erreur lors de l'ajout du service");
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (values) => {
    setIsSubmitting(true);
    try {
      const payload = { ...values };
      await serviceService.updateService(editingService._id || editingService.id, payload);
      message.success('Service modifié avec succès');
      setIsAddModalVisible(false);
      setIsSubmitting(false);
      setEditingService(null);
      fetchServices();
    } catch (error) {
      message.error(error?.message || "Erreur lors de la modification du service");
      setIsSubmitting(false);
    }
  };

  // Helper to preprocess initial values for the form
  const getInitialValues = (service) => {
    if (!service) return { status: 'pending' };
    return {
      ...service,
      customer: service.customer?._id || service.customer?.id,
      car: service.car?._id || service.car?.id,
      serviceType: service.serviceType,
      description: service.description,
      estimatedCost: typeof service.estimatedCost === 'object' && service.estimatedCost !== null
        ? parseFloat(service.estimatedCost.$numberDecimal || service.estimatedCost.value || '0')
        : service.estimatedCost,
      priority: service.priority,
      notes: service.notes,
    };
  };

  return (
    <>
      <PageHeader
        ghost
        title="Gestion des Services"
        subTitle={
          <span className="title-counter">{state.pagination.total} Services</span>
        }
      />
      <Main>
        <Cards headless>
          <Row gutter={16} align="middle" style={{ marginBottom: 24, justifyContent: 'flex-end', display: 'flex' }}>
            <Col>
              <Input
                placeholder="Rechercher des services..."
                value={searchText}
                onChange={handleSearch}
                onPressEnter={handleSearchEnter}
                style={{ width: 220, marginRight: 16 }}
                prefix={<FeatherIcon icon="search" size={14} />}
              />
              <Space>
                <span>Existants</span>
                <Switch
                  checked={deletedFilter === 'notDeleted'}
                  onChange={handleDeletedFilter}
                  checkedChildren=""
                  unCheckedChildren=""
                  style={{
                    backgroundColor: deletedFilter === 'notDeleted' ? '#b71c1c' : undefined,
                    borderColor: '#b71c1c',
                  }}
                />
                <span>Supprimés</span>
              </Space>
              <Button
                type="primary"
                size="default"
                style={{
                  background: '#b71c1c',
                  borderColor: '#b71c1c',
                  color: 'white',
                  marginLeft: 16,
                }}
                onClick={handleAdd}
              >
                <FeatherIcon icon="plus" size={14} /> Nouveau Service
              </Button>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={filteredServices}
            rowKey="id"
            pagination={state.pagination}
            loading={state.loading}
            onChange={handleTableChange}
          />
        </Cards>
        <AddServiceForm
          visible={isAddModalVisible}
          onCancel={() => { setIsAddModalVisible(false); setEditingService(null); }}
          onSubmit={editingService ? handleUpdate : handleSubmitAdd}
          loading={isSubmitting}
          initialValues={editingService ? getInitialValues(editingService) : { status: 'pending' }}
          modalTitle={editingService ? 'Modifier Service' : 'Nouveau Service'}
          okText={editingService ? 'Modifier' : 'Ajouter'}
          clients={state.customers}
          brands={brands}
        />
      </Main>
    </>
  );
};

export default ServicesList; 