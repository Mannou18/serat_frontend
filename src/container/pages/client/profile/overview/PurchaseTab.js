/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Table, Button, Tag, Modal, message, Row, Col } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Cards } from '../../../../../components/cards/frame/cards-frame';
import salesService from '../../../../../config/api/sales.service';
import AddSaleForm from '../../../sales/AddSaleForm';

const PurchaseTab = ({ clientData }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formResetTrigger, setFormResetTrigger] = useState(0);
  const [editingSale, setEditingSale] = useState(null);

  // Fetch sales for this client only
  const fetchClientSales = useCallback(async () => {
    if (!clientData?._id) return;
    setLoading(true);
    try {
      const response = await salesService.getSalesByCustomer(clientData._id);
      setSales(response.sales || response.data || []);
    } catch (error) {
      console.error('Error fetching client sales:', error);
      const errorMessage = error.message || 'Erreur lors du chargement des achats';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [clientData?._id]);

  useEffect(() => {
    fetchClientSales();
  }, [fetchClientSales]);

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Supprimer cet achat ?',
      onOk: async () => {
        try {
          await salesService.deleteSale(id);
          message.success('Achat supprimé');
          fetchClientSales();
        } catch (error) {
          console.error('Error deleting sale:', error);
          const errorMessage = error.message || 'Erreur lors de la suppression';
          message.error(errorMessage);
        }
      }
    });
  };

  const handleEdit = (id) => {
    const sale = sales.find(s => s._id === id);
    setEditingSale(sale);
    setIsAddModalVisible(true);
  };

  const handleAdd = () => {
    setEditingSale(null);
    setIsAddModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsAddModalVisible(false);
    setEditingSale(null);
    setFormResetTrigger(prev => prev + 1);
  };

  const handleModalSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      console.log('PurchaseTab: Submitting values:', values);
      
      if (editingSale) {
        await salesService.updateSale(editingSale._id, values);
        message.success('Achat modifié');
      } else {
        await salesService.createSale({ ...values, customer: clientData._id });
        message.success('Achat ajouté');
      }
      setIsAddModalVisible(false);
      setEditingSale(null);
      fetchClientSales();
    } catch (error) {
      console.error('Error submitting sale:', error);
      
      // Display the specific error message from the backend
      let errorMessage = 'Erreur lors de la soumission';
      
      if (error.response?.data?.message) {
        // If the backend returns a specific message
        errorMessage = error.response.data.message;
      } else if (error.message) {
        // If it's a general error message
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        // If error is directly a string
        errorMessage = error;
      }
      
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
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
        <div className="table-actions">
          <Button
            type="default"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record._id || record.id)}
            style={{ marginRight: 8 }}
          />
          <Button
            type="default"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record._id)}
          />
        </div>
      ),
    },
  ];

  return (
    <Cards headless>
      <Row gutter={16} align="middle" style={{ marginBottom: 24, justifyContent: 'flex-end', display: 'flex' }}>
        <Col span={24} style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontWeight: 600 }}>Liste des Achats du Client</h2>
        </Col>
        <Col>
          <Button
            type="primary"
            size="default"
            style={{
              background: '#b71c1c',
              borderColor: '#b71c1c',
              color: 'white',
            }}
            onClick={handleAdd}
          >
            <FeatherIcon icon="plus" size={14} style={{ marginRight: 5 }} /> Nouveau achat
          </Button>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={sales}
        rowKey="_id"
        loading={loading}
      />
      <AddSaleForm
        visible={isAddModalVisible}
        onCancel={handleModalCancel}
        onSubmit={handleModalSubmit}
        loading={isSubmitting}
        resetTrigger={formResetTrigger}
        initialValues={editingSale || {}}
        modalTitle={editingSale ? 'Modifier Achat' : 'Nouveau Achat'}
        okText={editingSale ? 'Mettre à jour' : 'Ajouter'}
        clientId={clientData._id}
      />
    </Cards>
  );
};

PurchaseTab.propTypes = {
  clientData: PropTypes.object.isRequired,
};

export default PurchaseTab; 