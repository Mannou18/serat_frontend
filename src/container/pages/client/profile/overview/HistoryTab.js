/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState } from 'react';
import { Table, Spin, message, Tag } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import axios from '../../../../../config/api/axios.config';
import { Cards } from '../../../../../components/cards/frame/cards-frame';
import productService from '../../../../../config/api/product.service';

const HistoryTab = ({ clientData }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, total: 0, pageSize: 10 });
  const [productMap, setProductMap] = useState({});

  useEffect(() => {
    // Fetch all products for name lookup
    const fetchProducts = async () => {
      try {
        const res = await productService.getAllProducts(1, 1000); // adjust limit as needed
        const products = res.products || res.data || [];
        const map = {};
        products.forEach(p => {
          map[p._id || p.id] = p.title || p.name || p.productName || 'Produit';
        });
        setProductMap(map);
      } catch (e) {
        // ignore
      }
    };
    fetchProducts();
  }, []);

  const columns = [
    {
      title: 'Date/Heure',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => timestamp ? moment(timestamp).format('DD/MM/YYYY HH:mm') : 'N/A',
    },
    { title: 'Action', dataIndex: 'action', key: 'action' },
    {
      title: 'Type',
      dataIndex: 'entityType',
      key: 'entityType',
      render: (type) => {
        let label = type ? type.toUpperCase() : 'N/A';
        let style = { fontWeight: 600, fontSize: 12, borderRadius: 3, padding: '0 10px', lineHeight: '22px', height: 22, display: 'inline-block', letterSpacing: 0.5, textTransform: 'uppercase', border: 'none' };
        if (type && type.toLowerCase() === 'service') {
          style = { ...style, background: '#1890ff', color: '#fff' }; // blue
        } else if (type && type.toLowerCase() === 'achat') {
          style = { ...style, background: '#ff9800', color: '#fff' }; // orange
        } else if (type && type.toLowerCase() === 'contrat') {
          style = { ...style, background: '#ffe066', color: '#333' }; // yellow
        } else if (type && type.toLowerCase() === 'voiture') {
          style = { ...style, background: '#40c4ff', color: '#fff' }; // light blue
        } else if (!type) {
          style = { ...style, background: '#f0f0f0', color: '#333', border: '1px solid #d9d9d9' };
          label = 'N/A';
        } else {
          style = { ...style, background: '#bfbfbf', color: '#fff' }; // neutral gray
        }
        return (
          <Tag style={style}>
            {label}
          </Tag>
        );
      }
    },
    {
      title: 'Détails',
      dataIndex: 'details',
      key: 'details',
      render: (details, record) => {
        if (!details) return 'N/A';
        if (record.entityType === 'Service') {
          return [
            details.serviceType ? `Type: ${details.serviceType}` : null,
            details.description ? `Description: ${details.description}` : null,
            details.status ? `Statut: ${details.status}` : null,
            details.estimatedCost ? `Coût: ${details.estimatedCost.$numberDecimal || details.estimatedCost}` : null,
            details.priority ? `Priorité: ${details.priority}` : null,
            details.notes ? `Notes: ${details.notes}` : null,
          ].filter(Boolean).join(', ');
        }
        if (record.entityType === 'Achat') {
          const items = Array.isArray(details.items)
            ? details.items.map((item) => {
                const price = item.unitPrice?.$numberDecimal || item.unitPrice || '';
                const total = item.totalPrice?.$numberDecimal || item.totalPrice || '';
                const productName = productMap[item.product] || item.product || 'Produit';
                return `Produit: ${productName}, Qté: ${item.quantity}, PU: ${price}, Total: ${total}`;
              }).join(' | ')
            : '';
          return [
            items ? `Articles: [${items}]` : null,
            details.totalAmount ? `Montant: ${details.totalAmount.$numberDecimal || details.totalAmount}` : null,
            details.paymentMethod ? `Paiement: ${details.paymentMethod}` : null,
            details.paymentStatus ? `Statut: ${details.paymentStatus}` : null,
            details.notes ? `Notes: ${details.notes}` : null,
          ].filter(Boolean).join(', ');
        }
        // Default fallback for other entity types
        return Object.entries(details)
          .filter(([key]) => !['_id', '__v', 'isDeleted', 'createdAt', 'updatedAt', 'createdBy', 'customer'].includes(key))
          .map(([key, value]) => `${key}: ${typeof value === 'object' && value?.$numberDecimal ? value.$numberDecimal : JSON.stringify(value)}`)
          .join(', ');
      },
    },
  ];

  useEffect(() => {
    const fetchLogs = async (page = 1, pageSize = 10) => {
      if (!clientData?._id) return;
      setLoading(true);
      try {
        const response = await axios.get(`/logs/customer/${clientData._id}?page=${page}&limit=${pageSize}`);
        const logsArray = response.data.logs || [];
        setLogs(logsArray);
        if (response.data.pagination) {
          setPagination({
            current: response.data.pagination.current || 1,
            total: response.data.pagination.totalRecords || logsArray.length,
            pageSize,
          });
        }
      } catch (error) {
        message.error('Erreur lors du chargement des logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs(pagination.current, pagination.pageSize);
    // eslint-disable-next-line
  }, [clientData?._id]);

  const handleTableChange = (pagination) => {
    // Fetch new page
    const { current, pageSize } = pagination;
    setPagination((prev) => ({ ...prev, current, pageSize }));
    // Refetch logs for new page
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/logs/customer/${clientData._id}?page=${current}&limit=${pageSize}`);
        const logsArray = response.data.logs || [];
        setLogs(logsArray);
        if (response.data.pagination) {
          setPagination({
            current: response.data.pagination.current || 1,
            total: response.data.pagination.totalRecords || logsArray.length,
            pageSize,
          });
        }
      } catch (error) {
        message.error('Erreur lors du chargement des logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  };

  return (
    <Cards headless>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey={record => record._id}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Spin>
    </Cards>
  );
};

HistoryTab.propTypes = {
  clientData: PropTypes.object.isRequired,
};

export default HistoryTab; 