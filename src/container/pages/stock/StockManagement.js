import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Modal, message, Tag, Tooltip, Input, InputNumber, Row, Col, Statistic } from 'antd';
import { EditOutlined, EyeOutlined, SearchOutlined, AlertOutlined, ReloadOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import { Link } from 'react-router-dom';
import moment from 'moment';

import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main, CardToolbox } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { AutoComplete } from '../../../components/autoComplete/autoComplete';

import productService from '../../../config/api/product.service';

const StockManagement = () => {
  const [state, setState] = useState({
    lowStockProducts: [],
    stockAlerts: [],
    loading: false,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    stats: {
      totalProducts: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
    },
  });

  const [searchText, setSearchText] = useState('');
  const [updateStockModal, setUpdateStockModal] = useState({
    visible: false,
    product: null,
    newStock: 0,
  });

  // Fetch low stock products
  const fetchLowStockProducts = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await productService.getLowStockProducts();
      const products = response.products || response.data || [];
      
      setState(prev => ({
        ...prev,
        lowStockProducts: products,
        stats: {
          totalProducts: response.totalProducts || 0,
          lowStockCount: response.lowStockCount || products.length,
          outOfStockCount: response.outOfStockCount || 0,
        },
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      message.error('Failed to fetch low stock products');
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Fetch stock alerts
  const fetchStockAlerts = useCallback(async () => {
    try {
      const response = await productService.getStockAlerts();
      setState(prev => ({
        ...prev,
        stockAlerts: response.alerts || response.data || [],
      }));
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
    }
  }, []);

  useEffect(() => {
    fetchLowStockProducts();
    fetchStockAlerts();
  }, [fetchLowStockProducts, fetchStockAlerts]);

  const handleUpdateStock = async () => {
    const { product, newStock } = updateStockModal;
    try {
      await productService.updateProductStock(product.id, { stock: newStock });
      message.success('Stock mis à jour avec succès');
      setUpdateStockModal({ visible: false, product: null, newStock: 0 });
      fetchLowStockProducts();
    } catch (error) {
      message.error('Erreur lors de la mise à jour du stock');
    }
  };

  const getStockStatusColor = (stock, minStock) => {
    if (stock <= 0) return 'red';
    if (stock <= minStock) return 'orange';
    return 'green';
  };

  const getStockStatusText = (stock, minStock) => {
    if (stock <= 0) return 'Rupture de stock';
    if (stock <= minStock) return 'Stock faible';
    return 'En stock';
  };

  const columns = [
    {
      title: 'Produit',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <strong>{name}</strong>
          <br />
          <small style={{ color: '#666' }}>Ref: {record.reference}</small>
        </div>
      ),
    },
    {
      title: 'Catégorie',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color="blue">
          {category?.name || category}
        </Tag>
      ),
    },
    {
      title: 'Stock Actuel',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock, record) => (
        <span style={{ fontWeight: 'bold', color: getStockStatusColor(stock, record.minStock) }}>
          {stock}
        </span>
      ),
    },
    {
      title: 'Stock Minimum',
      dataIndex: 'minStock',
      key: 'minStock',
      render: (minStock) => <span>{minStock}</span>,
    },
    {
      title: 'Statut',
      key: 'status',
      render: (_, record) => (
        <Tag color={getStockStatusColor(record.stock, record.minStock)}>
          {getStockStatusText(record.stock, record.minStock)}
        </Tag>
      ),
    },
    {
      title: 'Dernière Mise à Jour',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space size="middle">
          <Tooltip title="Voir les détails">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => window.open(`/admin/product/${record.id}`, '_blank')}
            />
          </Tooltip>
          <Tooltip title="Modifier le stock">
            <Button
              type="default"
              icon={<EditOutlined />}
              size="small"
              onClick={() => setUpdateStockModal({
                visible: true,
                product: record,
                newStock: record.stock,
              })}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredProducts = state.lowStockProducts.filter(product =>
    product.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    product.reference?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <>
      <CardToolbox>
        <PageHeader
          ghost
          title="Gestion des Stocks"
          subTitle={
            <>
              <span className="title-counter">{state.stats.lowStockCount} Produits en stock faible</span>
              <AutoComplete
                onSearch={setSearchText}
                placeholder="Rechercher par nom, référence..."
                width="100%"
                patterns
              />
            </>
          }
          buttons={[
            <Button 
              className="btn-refresh" 
              size="default" 
              key="1"
              onClick={() => {
                fetchLowStockProducts();
                fetchStockAlerts();
              }}
            >
              <ReloadOutlined /> Actualiser
            </Button>,
            <Button className="btn-add_new" size="default" type="primary" key="2">
              <Link to="/admin/product-list">
                <FeatherIcon icon="shopping-cart" size={14} /> Gérer les Produits
              </Link>
            </Button>,
          ]}
        />
      </CardToolbox>

      <Main>
        {/* Statistiques */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Cards headless>
              <Statistic
                title="Total Produits"
                value={state.stats.totalProducts}
                prefix={<FeatherIcon icon="package" size={20} />}
              />
            </Cards>
          </Col>
          <Col span={8}>
            <Cards headless>
              <Statistic
                title="Stock Faible"
                value={state.stats.lowStockCount}
                valueStyle={{ color: '#faad14' }}
                prefix={<AlertOutlined />}
              />
            </Cards>
          </Col>
          <Col span={8}>
            <Cards headless>
              <Statistic
                title="Rupture de Stock"
                value={state.stats.outOfStockCount}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<AlertOutlined />}
              />
            </Cards>
          </Col>
        </Row>

        {/* Alertes de stock */}
        {state.stockAlerts.length > 0 && (
          <Cards headless style={{ marginBottom: 24 }}>
            <h3>Alertes de Stock</h3>
            {state.stockAlerts.map((alert, index) => (
              <div key={index} style={{ 
                padding: '8px 12px', 
                marginBottom: 8, 
                backgroundColor: '#fff2e8', 
                border: '1px solid #ffbb96',
                borderRadius: 4
              }}>
                <AlertOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
                {alert.message}
              </div>
            ))}
          </Cards>
        )}

        {/* Table des produits en stock faible */}
        <Cards headless>
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="Rechercher..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
            />
          </div>

          <Table
            columns={columns}
            dataSource={filteredProducts}
            rowKey="id"
            loading={state.loading}
            scroll={{ x: 1000 }}
          />
        </Cards>
      </Main>

      {/* Modal de mise à jour du stock */}
      <Modal
        title="Mettre à jour le stock"
        visible={updateStockModal.visible}
        onOk={handleUpdateStock}
        onCancel={() => setUpdateStockModal({ visible: false, product: null, newStock: 0 })}
        okText="Mettre à jour"
        cancelText="Annuler"
      >
        {updateStockModal.product && (
          <div>
            <p><strong>Produit:</strong> {updateStockModal.product.name}</p>
            <p><strong>Stock actuel:</strong> {updateStockModal.product.stock}</p>
            <p><strong>Nouveau stock:</strong></p>
            <InputNumber
              min={0}
              value={updateStockModal.newStock}
              onChange={(value) => setUpdateStockModal(prev => ({ ...prev, newStock: value }))}
              style={{ width: '100%' }}
            />
          </div>
        )}
      </Modal>
    </>
  );
};

export default StockManagement; 