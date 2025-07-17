/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Space, Input, Row, Col, Spin, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import AddNeotrack from './AddNeotrack';
import neotrackService from '../../../config/api/neotrackService';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Main } from '../../styled';

const NeotrackList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editing, setEditing] = useState();
  const [search, setSearch] = useState('');
  const [modalError, setModalError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await neotrackService.getNeotracks();
      // Try to find the array in the response
      let list = [];
      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (Array.isArray(res.data?.neotracks)) {
        list = res.data.neotracks;
      } else if (Array.isArray(res.neotracks)) {
        list = res.neotracks;
      } else if (Array.isArray(res)) {
        list = res;
      }
      setData(list);
    } catch (e) {
      message.error('Erreur lors du chargement des Neotracks');
      setData([]); // fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = () => {
    setEditing(undefined);
    setModalError(null);
    setModalVisible(true);
  };
  const handleDelete = async (id) => {
    try {
      await neotrackService.deleteNeotrack(id);
      message.success('Neotrack supprimé');
      fetchData();
    } catch {
      message.error('Erreur lors de la suppression');
    }
  };
  const handleSubmit = async (values) => {
    setModalLoading(true);
    setModalError(null);
    try {
      if (editing && editing._id) {
        await neotrackService.updateNeotrack(editing._id, values);
        message.success('Neotrack mis à jour');
      } else {
        await neotrackService.addNeotrack(values);
        message.success('Neotrack ajouté');
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      let errorMsg = 'Erreur lors de l\'enregistrement';
      if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      setModalError(errorMsg);
      message.error(errorMsg);
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    { title: 'Numéro de série', dataIndex: 'serialNumber', key: 'serialNumber' },
    {
      title: 'Client',
      key: 'customer',
      render: (_, r) => {
        // Prefer populated customer object
        if (r.customer && typeof r.customer === 'object' && (r.customer.fname || r.customer.lname)) {
          return `${r.customer.fname || ''} ${r.customer.lname || ''}`.trim() || '-';
        }
        // Fallback to details.user
        if (r.details && r.details.user) {
          return `${r.details.user.fname || ''} ${r.details.user.lname || ''}`.trim() || '-';
        }
        return '-';
      }
    },
    {
      title: 'Téléphone',
      key: 'phone',
      render: (_, r) => {
        if (r.customer && typeof r.customer === 'object' && r.customer.phone) {
          return r.customer.phone;
        }
        if (r.details && r.details.user && r.details.user.phone) {
          return r.details.user.phone;
        }
        return '-';
      }
    },
    {
      title: 'Voiture',
      key: 'car',
      render: (_, r) => {
        // Prefer populated car object
        if (r.car && typeof r.car === 'object' && (r.car.brand || r.car.model || r.car.plate_number)) {
          return `${r.car.brand || ''} ${r.car.model || ''} (${r.car.plate_number || ''})`.trim() || '-';
        }
        // Fallback to details.car
        if (r.details && r.details.car) {
          return `${r.details.car.brand || ''} ${r.details.car.model || ''} (${r.details.car.plate_number || ''})`.trim() || '-';
        }
        // Fallback to top-level fields
        if (r.brand || r.model || r.plate_number) {
          return `${r.brand || ''} ${r.model || ''} (${r.plate_number || ''})`.trim() || '-';
        }
        return '-';
      }
    },
    {
      title: 'IMEI',
      key: 'imei',
      render: (_, r) => {
        if (r.car && typeof r.car === 'object' && r.car.imei) return r.car.imei;
        if (r.details && r.details.car && r.details.car.imei) return r.details.car.imei;
        if (r.imei) return r.imei;
        return '-';
      }
    },
    {
      title: 'SIM Boitier',
      key: 'sim_device',
      render: (_, r) => {
        if (r.car && typeof r.car === 'object' && r.car.sim_device) return r.car.sim_device;
        if (r.details && r.details.car && r.details.car.sim_device) return r.details.car.sim_device;
        if (r.sim_device) return r.sim_device;
        return '-';
      }
    },
    {
      title: 'Prix',
      dataIndex: 'price',
      key: 'price',
      render: v => {
        let num = v;
        if (v && typeof v === 'object' && v.$numberDecimal) num = parseFloat(v.$numberDecimal);
        if (typeof num === 'string') num = parseFloat(num);
        if (typeof num === 'number' && !Number.isNaN(num)) {
          return (
            <Tag style={{ background: '#52c41a', color: '#fff', fontWeight: 600, fontSize: 15, borderRadius: 6, border: 'none', padding: '2px 16px' }}>
              {num.toFixed(2)} DT
            </Tag>
          );
        }
        return '-';
      }
    },
    {
      title: 'Date achat',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      render: d => d ? new Date(d).toLocaleDateString() : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_ , record) => (
        <Space>
          {/* <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} /> */}
          <Popconfirm title="Supprimer ce Neotrack ?" onConfirm={() => handleDelete(record._id)} okText="Oui" cancelText="Non">
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Main>
      <Row gutter={15}>
        <Col xs={24}>
          <Cards headless>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <Input.Search
                placeholder="Rechercher..."
                style={{ width: 250 }}
                onChange={e => setSearch(e.target.value)}
                allowClear
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ background: '#b71c1c', borderColor: '#b71c1c', color: '#fff', fontWeight: 600 }}
                onClick={handleAdd}
              >
                 Ajouter
              </Button>
            </div>
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={Array.isArray(data) ? data.filter(item => !search || (item.serialNumber && item.serialNumber.toLowerCase().includes(search.toLowerCase()))) : []}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
              />
            </Spin>
            <AddNeotrack
              visible={modalVisible}
              onCancel={() => { setModalVisible(false); setModalError(null); }}
              onSubmit={handleSubmit}
              loading={modalLoading}
              initialValues={editing}
              error={modalError}
            />
          </Cards>
        </Col>
      </Row>
    </Main>
  );
};

export default NeotrackList; 