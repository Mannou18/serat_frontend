import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Space, Modal, message, Tag, Tooltip, Input, Row, Switch, Col } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import moment from 'moment';
import qs from 'qs';
import debounce from 'lodash/debounce';
import AddSaleForm from './AddSaleForm';

import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';

import salesService from '../../../config/api/sales.service';
import clientService from '../../../config/api/client.service';
import productService from '../../../config/api/product.service';

/* eslint-disable no-underscore-dangle */

const SalesList = () => {
  const [state, setState] = useState({
    sales: [],
    loading: false,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    filters: {},
    customers: [],
    products: [],
  });

  const [searchText, setSearchText] = useState('');
  const [deletedFilter, setDeletedFilter] = useState('notDeleted');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formResetTrigger, setFormResetTrigger] = useState(0);
  const [editingSale, setEditingSale] = useState(null);

  // Fetch sales data
  const fetchSales = useCallback(async (page = 1, pageSize = 10, filters = {}) => {
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
      const response = await salesService.getAllSalesWithQuery(qs.stringify(queryParams));
      setState(prev => ({
        ...prev,
        sales: response.sales || response.data || [],
        pagination: {
          ...prev.pagination,
          current: page,
          pageSize,
          total: response.pagination?.totalRecords || response.totalSales || response.total || 0,
        },
        loading: false,
      }));
    } catch (error) {
      message.error('Erreur lors du chargement des achats');
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Debounced fetch for search
  const debouncedFetchSales = useCallback(
    debounce((search, deleted) => {
      fetchSales(1, state.pagination.pageSize, { searchText: search, deletedFilter: deleted });
    }, 400),
    [state.pagination.pageSize]
  );

  // Fetch customers and products for filters
  const fetchFiltersData = useCallback(async () => {
    try {
      const [customersResponse, productsResponse] = await Promise.all([
        clientService.getAllClients(1, 1000),
        productService.getAllProducts(1, 1000),
      ]);

      setState(prev => ({
        ...prev,
        customers: customersResponse.customers || customersResponse.data || [],
        products: productsResponse.products || productsResponse.data || [],
      }));
    } catch (error) {
      console.error('Error fetching filters data:', error);
    }
  }, []);

  useEffect(() => {
    fetchSales();
    fetchFiltersData();
  }, [fetchSales, fetchFiltersData]);

  const handleTableChange = (pagination, filters) => {
    fetchSales(pagination.current, pagination.pageSize, filters);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
    debouncedFetchSales(e.target.value, deletedFilter);
  };

  const handleSearchEnter = () => {
    fetchSales(1, state.pagination.pageSize, { searchText, deletedFilter });
  };

  const handleDeletedFilter = (checked) => {
    const value = checked ? 'notDeleted' : 'deleted';
    setDeletedFilter(value);
    fetchSales(1, state.pagination.pageSize, { searchText, deletedFilter: value });
  };

  useEffect(() => {
    fetchSales(1, state.pagination.pageSize, { searchText, deletedFilter });
    // eslint-disable-next-line
  }, []);

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Supprimer cet achat ?',
      onOk: async () => {
        try {
          await salesService.deleteSale(id);
          message.success('Achat supprimé');
          fetchSales();
        } catch (error) {
          message.error("Erreur lors de la suppression");
        }
      }
    });
  };

  const handleEdit = async (saleId) => {
    try {
      const sale = await salesService.getSale(saleId);
      setEditingSale(sale);
      setIsAddModalVisible(true);
    } catch (error) {
      message.error("Erreur lors du chargement de l'achat");
    }
  };

  const columns = [
    {
      title: 'Référence',
      dataIndex: '_id',
      key: '_id',
      render: (id) => id || 'N/A',
    },
    {
      title: 'Client',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer) =>
        customer
          ? `${customer.fname || customer.firstName || ''} ${customer.lname || customer.lastName || ''}`.trim() ||
            customer.name ||
            customer.cin ||
            'N/A'
          : 'N/A',
    },
    {
      title: 'Article',
      dataIndex: 'items',
      key: 'items',
      render: (items) =>
        Array.isArray(items)
          ? items.map((item, idx) =>
              <span key={item._id || idx} style={{ marginRight: 8 }}>
                {(item.product?.title || item.product?.name || item.productName || 'Produit')} (x{item.quantity})
              </span>
            )
          : 'N/A',
    },
    {
      title: 'Montant Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) =>
        typeof amount === 'number'
          ? <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{amount.toLocaleString('fr-FR')} DT</span>
          : 'N/A',
    },
    {
      title: 'Méthode de paiement',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => method ? method.charAt(0).toUpperCase() + method.slice(1) : 'N/A',
    },
    {
      title: 'Statut Paiement',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => {
        let label = status ? status.replace('_', ' ').toUpperCase() : 'N/A';
        let style = { fontWeight: 500, fontSize: 12, borderRadius: 3, padding: '0 8px', lineHeight: '22px', height: 22, display: 'inline-block', letterSpacing: 0.5 };

        if (status === 'en_cours') {
          style = { ...style, background: '#ff9800', color: '#fff', border: 'none' }; // orange
        } else if (status === 'pending') {
          style = { ...style, background: '#1890ff', color: '#fff', border: 'none' }; // blue
        } else if (status === 'paid') {
          style = { ...style, background: '#52c41a', color: '#fff', border: 'none' }; // green
        } else if (!status) {
          style = { ...style, background: '#f0f0f0', color: '#333', border: '1px solid #d9d9d9' };
          label = 'N/A';
        } else {
          style = { ...style, background: '#bfbfbf', color: '#fff', border: 'none' }; // neutral gray
        }

        return (
          <Tag style={style}>
            {label}
          </Tag>
        );
      },
    },
    {
      title: 'Date',
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
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setIsAddModalVisible(true);
  };

  const handleSubmitAdd = async (values) => {
    setIsSubmitting(true);
    try {
      const payload = {
        customer: values.customer,
        items: (values.products || []).map(p => ({ product: p.product, quantity: p.quantity })),
        status: values.status || 'en_cours',
        // Optionally add paymentMethod, notes, etc.
      };
      await salesService.createSale(payload);
      message.success('Achat ajouté avec succès');
      setIsAddModalVisible(false);
      setIsSubmitting(false);
      setFormResetTrigger(prev => prev + 1);
      fetchSales();
    } catch (error) {
      message.error(error?.message || "Erreur lors de l'ajout de l'achat");
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (values) => {
    setIsSubmitting(true);
    try {
      const payload = {
        customer: values.customer,
        items: (values.products || []).map(p => ({ product: p.product, quantity: p.quantity })),
        status: values.status || 'en_cours',
        totalAmount: values.totalAmount,
        paymentStatus: values.paymentStatus,
        // Optionally add paymentMethod, notes, etc.
      };
      await salesService.updateSale(editingSale._id || editingSale.id, payload);
      message.success('Achat modifié avec succès');
      setIsAddModalVisible(false);
      setIsSubmitting(false);
      setEditingSale(null);
      fetchSales();
    } catch (error) {
      message.error(error?.message || "Erreur lors de la modification de l'achat");
      setIsSubmitting(false);
    }
  };

  // after fetching sales from backend, filter them client-side if needed
  const filteredSales = useMemo(() => {
    let data = state.sales;
    // Filter by deleted status
    if (deletedFilter === 'deleted') {
      data = data.filter(sale => sale.isDeleted);
    } else if (deletedFilter === 'notDeleted') {
      data = data.filter(sale => !sale.isDeleted);
    }
    // Filter by searchText
    if (searchText) {
      const search = searchText.toLowerCase();
      data = data.filter(sale => {
        // Check montant total
        if (String(sale.totalAmount).toLowerCase().includes(search)) return true;
        // Check client name
        if (sale.customer && `${sale.customer.fname || ''} ${sale.customer.lname || ''}`.toLowerCase().includes(search)) return true;
        // Check produits
        if (Array.isArray(sale.items) && sale.items.some(item => (item.product?.title || '').toLowerCase().includes(search))) return true;
        // Check reference
        if ((sale._id || '').toLowerCase().includes(search)) return true;
        return false;
      });
    }
    return data;
  }, [state.sales, searchText, deletedFilter]);

  return (
    <>
      <PageHeader
        ghost
        title="Gestion des achats"
        subTitle={
          <span className="title-counter">{state.pagination.total} Achats</span>
        }
      />
      <Main>
        <Cards headless>
          <Row gutter={16} align="middle" style={{ marginBottom: 24, justifyContent: 'flex-end', display: 'flex' }}>
            <Col>
              <Input
                placeholder="Rechercher des achats..."
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
                <FeatherIcon icon="plus" size={14} /> Nouveau achat
              </Button>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={filteredSales}
            rowKey="id"
            pagination={state.pagination}
            loading={state.loading}
            onChange={handleTableChange}
          />
        </Cards>
        <AddSaleForm
          visible={isAddModalVisible}
          onCancel={() => { setIsAddModalVisible(false); setEditingSale(null); }}
          onSubmit={editingSale ? handleUpdate : handleSubmitAdd}
          loading={isSubmitting}
          resetTrigger={formResetTrigger}
          initialValues={editingSale ? {
            customer: editingSale.customer?._id || editingSale.customer?.id,
            products: (editingSale.items || []).map(item => ({ product: item.product?._id || item.product?.id, quantity: item.quantity })),
            totalAmount: editingSale.totalAmount,
            paymentStatus: editingSale.paymentStatus,
            status: editingSale.status || 'en_cours',
          } : { status: 'en_cours' }}
          modalTitle={editingSale ? 'Modifier Achat' : 'Nouvel Achat'}
          okText={editingSale ? 'Modifier' : 'Ajouter'}
        />
      </Main>
    </>
  );
};

export default SalesList; 