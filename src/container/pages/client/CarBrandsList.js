import React, { useState, useEffect } from 'react';
import { Row, Col, Table, message, Popconfirm, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import qs from 'qs';
import AddCarBrandForm from './AddCarBrandForm';
import carBrandService from '../../../config/api/carBrand.service';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import { Button } from '../../../components/buttons/buttons';

function CarBrandsList() {
  const [state, setState] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    loading: false,
    brands: [],
    total: 0,
    isAddModalVisible: false,
    isSubmitting: false,
    formResetTrigger: 0,
    deletedFilter: 'notDeleted',
  });
  const [editingBrand, setEditingBrand] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // Fetch brands from API
  const fetchBrands = async (page = 1, pageSize = 10) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const params = {
        page,
        limit: pageSize,
        isDeleted: state.deletedFilter === 'deleted',
      };
      
      const queryString = qs.stringify(params);
      const response = await carBrandService.getAllBrandsWithQuery(queryString);
      const brands = Array.isArray(response) ? response : (response.brands || response.data || []);
      
      setState(prev => ({
        ...prev,
        brands,
        total: response.totalBrands || brands.length,
        pagination: {
          ...prev.pagination,
          current: response.currentPage || 1,
          total: response.totalBrands || brands.length,
          pageSize: response.pageSize || prev.pagination.pageSize,
          totalPages: response.totalPages || Math.ceil(brands.length / prev.pagination.pageSize),
        },
        loading: false,
      }));
    } catch (error) {
      message.error('Erreur lors du chargement des marques');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchBrands(1, state.pagination.pageSize);
  }, [state.deletedFilter]);

  const handleTableChange = (pagination) => {
    fetchBrands(pagination.current, pagination.pageSize);
  };

  const handleAdd = () => {
    setState(prev => ({ ...prev, isAddModalVisible: true }));
  };

  const handleEdit = async (record) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      // eslint-disable-next-line no-underscore-dangle
      const brand = await carBrandService.getBrand(record._id);
      setEditingBrand(brand.data);
      setIsEditModalVisible(true);
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      message.error('Erreur lors du chargement de la marque');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDelete = async (record) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      // eslint-disable-next-line no-underscore-dangle
      await carBrandService.deleteBrand(record._id);
      message.success('Marque supprimée avec succès');
      fetchBrands(state.pagination.current, state.pagination.pageSize);
    } catch (error) {
      message.error(error?.message || 'Erreur lors de la suppression de la marque');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCancelAdd = () => {
    setState(prev => ({ ...prev, isAddModalVisible: false }));
  };

  const handleSubmitAdd = async (values) => {
    setState(prev => ({ ...prev, isSubmitting: true }));
    try {
      await carBrandService.addBrand(values);
      message.success('Marque ajoutée avec succès');
      setState(prev => ({
        ...prev,
        isAddModalVisible: false,
        isSubmitting: false,
        formResetTrigger: prev.formResetTrigger + 1,
      }));
      fetchBrands(state.pagination.current, state.pagination.pageSize);
    } catch (error) {
      message.error(error?.message || 'Erreur lors de l\'ajout de la marque');
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    setEditingBrand(null);
  };

  const handleSubmitEdit = async (values) => {
    if (!editingBrand) return;
    setIsEditSubmitting(true);
    try {
      // eslint-disable-next-line no-underscore-dangle
      await carBrandService.updateBrand(editingBrand._id, values);
      message.success('Marque mise à jour avec succès');
      setIsEditModalVisible(false);
      setEditingBrand(null);
      setIsEditSubmitting(false);
      fetchBrands(state.pagination.current, state.pagination.pageSize);
    } catch (error) {
      message.error(error?.message || 'Erreur lors de la mise à jour de la marque');
      setIsEditSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Nom de la marque',
      dataIndex: 'brand_name',
      key: 'brand_name',
      sorter: (a, b) => a.brand_name.localeCompare(b.brand_name),
    },
    {
      title: 'Modèles',
      dataIndex: 'model_names',
      key: 'model_names',
      render: (modelNames) => modelNames?.join(', ') || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 90,
      render: (text, record) => (
        <Space size={0} direction="horizontal" style={{ display: 'flex', gap: 8 }}>
          <Button
            type="default"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer cette marque ?"
            onConfirm={() => handleDelete(record)}
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

  return (
    <>
      <Main>
        <PageHeader title="Marques de voitures" />
        <Row gutter={15} style={{ justifyContent: 'flex-end', display: 'flex', marginBottom: 16 }}>
          <Col>
            <Button
              type="primary"
              style={{ background: '#b71c1c', borderColor: '#b71c1c', color: '#fff', fontWeight: 600 }}
              onClick={handleAdd}
            >
              + Ajouter une marque
            </Button>
          </Col>
        </Row>
        <div className="table-responsive">
          <Table
            columns={columns}
            dataSource={state.brands}
            rowKey="_id"
            pagination={state.pagination}
            loading={state.loading}
            onChange={handleTableChange}
          />
        </div>
      </Main>

      {/* Add Brand Modal */}
      <AddCarBrandForm
        visible={state.isAddModalVisible}
        onCancel={handleCancelAdd}
        onSubmit={handleSubmitAdd}
        isSubmitting={state.isSubmitting}
        formResetTrigger={state.formResetTrigger}
      />

      {/* Edit Brand Modal */}
      {editingBrand && (
        <>
          {console.log('Editing brand:', editingBrand)}
          <AddCarBrandForm
            visible={isEditModalVisible}
            onCancel={handleCancelEdit}
            onSubmit={handleSubmitEdit}
            isSubmitting={isEditSubmitting}
            initialValues={editingBrand}
            isEdit
          />
        </>
      )}
    </>
  );
}

export default CarBrandsList; 