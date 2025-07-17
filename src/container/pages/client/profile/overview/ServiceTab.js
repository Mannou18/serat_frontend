/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Table, Button, Tag, Modal, message, Row, Col } from 'antd';
import FeatherIcon from 'feather-icons-react';
import moment from 'moment';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Cards } from '../../../../../components/cards/frame/cards-frame';
import serviceService from '../../../../../config/api/service.service';
import AddServiceForm from '../../../services/AddServiceForm';

const ServiceTab = ({ clientData }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formResetTrigger, setFormResetTrigger] = useState(0);
  const [editingService, setEditingService] = useState(null);

  // Fetch services for this client only
  const fetchClientServices = useCallback(async () => {
    if (!clientData?._id) return;
    setLoading(true);
    try {
      const response = await serviceService.getServicesByCustomer(clientData._id);
      setServices(response.services || response.data || []);
    } catch (error) {
      message.error('Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  }, [clientData?._id]);

  useEffect(() => {
    fetchClientServices();
  }, [fetchClientServices]);

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Supprimer ce service ?',
      onOk: async () => {
        try {
          await serviceService.deleteService(id);
          message.success('Service supprimé');
          fetchClientServices();
        } catch (error) {
          message.error("Erreur lors de la suppression");
        }
      }
    });
  };

  const handleEdit = (id) => {
    const service = services.find(s => s._id === id);
    setEditingService(service);
    setIsAddModalVisible(true);
  };

  const handleAdd = () => {
    setEditingService(null);
    setIsAddModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsAddModalVisible(false);
    setEditingService(null);
    setFormResetTrigger(prev => prev + 1);
  };

  const handleModalSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      if (editingService) {
        await serviceService.updateService(editingService._id, values);
        message.success('Service modifié');
      } else {
        await serviceService.addService({ ...values, customer: clientData._id });
        message.success('Service ajouté');
      }
      setIsAddModalVisible(false);
      setEditingService(null);
      fetchClientServices();
    } catch (error) {
      message.error('Erreur lors de la soumission');
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
      title: 'Type de Service',
      dataIndex: 'serviceType',
      key: 'serviceType',
      render: (type) => {
        let color = 'default';
        let textColor = '#fff';
        switch (type) {
          case 'repair': color = '#1890ff'; break;        // blue
          case 'maintenance': color = '#ff9800'; break;   // orange
          case 'inspection': color = '#ffe066'; textColor = '#333'; break;    // yellow
          case 'installation': color = '#40c4ff'; break; // light blue
          case 'other': color = '#bfbfbf'; break;         // gray
          default: color = '#bfbfbf';
        }
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
            color: textColor,
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
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {typeof price === 'number' ? price.toLocaleString('fr-FR') : price} DT
        </span>
      ),
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
            onClick={() => handleDelete(record._id || record.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <Cards headless>
      <Row gutter={16} align="middle" style={{ marginBottom: 24, justifyContent: 'flex-end', display: 'flex' }}>
        <Col span={24} style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontWeight: 600 }}>Liste des Services du Client</h2>
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
            <FeatherIcon icon="plus" size={14} style={{ marginRight: 5 }} /> Nouveau Service
          </Button>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={services}
        rowKey="_id"
        loading={loading}
      />
      <AddServiceForm
        visible={isAddModalVisible}
        onCancel={handleModalCancel}
        onSubmit={handleModalSubmit}
        loading={isSubmitting}
        resetTrigger={formResetTrigger}
        initialValues={editingService || {}}
        modalTitle={editingService ? 'Modifier Service' : 'Nouveau Service'}
        okText={editingService ? 'Mettre à jour' : 'Ajouter'}
        clientId={clientData._id}
      />
    </Cards>
  );
};

ServiceTab.propTypes = {
  clientData: PropTypes.object.isRequired,
};

export default ServiceTab; 