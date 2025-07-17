import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Table, Button, Input, Modal, Switch, Space, Tooltip, message } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined, SearchOutlined, CarOutlined } from '@ant-design/icons';
import VoitureModal from './VoitureModal';
import { fetchVoitures, deleteVoiture } from '../../../redux/voitures/actions';

const { Search } = Input;

const VoituresList = () => {
  const dispatch = useDispatch();
  const { voitures, loading } = useSelector(state => state.voitures);
  const [showModal, setShowModal] = useState(false);
  const [editingVoiture, setEditingVoiture] = useState(null);
  const [filterDeleted, setFilterDeleted] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchVoitures({ deleted: filterDeleted, search }));
  }, [dispatch, filterDeleted, search]);

  const handleAdd = () => {
    setEditingVoiture(null);
    setShowModal(true);
  };

  const handleEdit = (voiture) => {
    setEditingVoiture(voiture);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Supprimer cette voiture ?',
      content: 'Êtes-vous sûr de vouloir supprimer cette voiture ?',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        dispatch(deleteVoiture(id))
          .then(() => message.success('Voiture supprimée'))
          .catch(() => message.error('Erreur lors de la suppression'));
      },
    });
  };

  const columns = [
    {
      title: 'Marque',
      dataIndex: 'marque',
      key: 'marque',
    },
    {
      title: 'Modèle',
      dataIndex: 'modele',
      key: 'modele',
    },
    {
      title: 'Immatriculation',
      dataIndex: 'immatriculation',
      key: 'immatriculation',
    },
    {
      title: 'Propriétaire',
      dataIndex: 'proprietaire',
      key: 'proprietaire',
    },
    {
      title: 'Téléphone',
      dataIndex: 'telephone',
      key: 'telephone',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Voir">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleEdit(record)}
              type="default"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
              type="primary"
              danger
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <CarOutlined />
          <span>Liste des voitures</span>
        </Space>
      }
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={{ background: '#52c41a', borderColor: '#52c41a' }}
        >
          + Ajouter une voiture
        </Button>
      }
      style={{ margin: 24 }}
    >
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between', display: 'flex' }}>
        <Search
          placeholder="Rechercher une voiture"
          onSearch={setSearch}
          allowClear
          style={{ width: 250 }}
          prefix={<SearchOutlined />}
        />
        <Space>
          <span>Existantes</span>
          <Switch
            checkedChildren="Supprimées"
            unCheckedChildren="Existantes"
            checked={filterDeleted}
            onChange={setFilterDeleted}
          />
          <span>Supprimées</span>
        </Space>
      </Space>
      <Table
        columns={columns}
        dataSource={voitures}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <VoitureModal
        visible={showModal}
        onCancel={() => setShowModal(false)}
        voiture={editingVoiture}
      />
    </Card>
  );
};

export default VoituresList; 