/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useCallback } from 'react';
import qs from 'qs';
import { Row, Col, Table, Input, Spin, message, Popconfirm, Modal, Form, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { CategoryListWrapper } from './style';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Button } from '../../../components/buttons/buttons';
import categoryService from '../../../config/api/category.service';

function CategoryList() {
  const [state, setState] = useState({
    searchText: '',
    pagination: {
      current: 1,
      pageSize: 10,
    },
    loading: false,
    categories: [],
    total: 0,
    isAddModalVisible: false,
    isSubmitting: false,
    formResetTrigger: 0,
  });

  const [editingCategory, setEditingCategory] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchCategories = useCallback(async (page = 1, pageSize = 10, filters = {}) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const queryParams = {
        page,
        limit: pageSize,
        ...filters,
      };
      const response = await categoryService.getAllCategoriesWithQuery(qs.stringify(queryParams));
      setState(prev => ({
        ...prev,
        categories: response.categories,
        total: response.totalCategories,
        pagination: {
          ...prev.pagination,
          current: page,
          pageSize,
        },
      }));
    } catch (error) {
      message.error('Failed to fetch categories');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleTableChange = (pagination) => {
    fetchCategories(pagination.current, pagination.pageSize, {
      search: state.searchText,
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
      await categoryService.addCategory(values);
      message.success('Catégorie ajoutée avec succès');
      setState(prev => ({
        ...prev,
        isAddModalVisible: false,
        formResetTrigger: prev.formResetTrigger + 1,
      }));
      fetchCategories();
    } catch (error) {
      message.error('Échec de l\'ajout de la catégorie');
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleEdit = (record) => {
    setEditingCategory(record);
    form.setFieldsValue({
      title: record.title,
    });
    setIsEditModalVisible(true);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setIsEditModalVisible(false);
    form.resetFields();
  };

  const handleSubmitEdit = async (values) => {
    if (!editingCategory) return;
    setIsEditSubmitting(true);
    try {
      // eslint-disable-next-line no-underscore-dangle
      await categoryService.updateCategory(editingCategory._id, values);
      message.success('Catégorie mise à jour avec succès');
      setIsEditModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
      fetchCategories();
    } catch (error) {
      message.error('Échec de la mise à jour de la catégorie');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      // eslint-disable-next-line no-underscore-dangle
      await categoryService.deleteCategory(id);
      message.success('Catégorie supprimée avec succès');
      fetchCategories();
    } catch (error) {
      message.error('Échec de la suppression de la catégorie');
    }
  };

  const columns = [
    {
      title: 'Nom de la catégorie',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 90,
      render: (_, record) => (
        <Space size={0} direction="horizontal" style={{ display: 'flex', gap: 8 }}>
          <Button
            type="default"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer cette catégorie ?"
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

  return (
    <CategoryListWrapper>
      <PageHeader
        ghost
        title="Catégories"
      />
      <Main>
        <Row gutter={15}>
          <Col xs={24}>
            <Cards>
              <div className="search-box" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <Input
                  placeholder="Rechercher des catégories..."
                  style={{ width: 220 }}
                  onChange={e => setState(prev => ({ ...prev, searchText: e.target.value }))}
                  allowClear
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ background: '#b71c1c', borderColor: '#b71c1c', color: '#fff', fontWeight: 600 }}
                  onClick={handleAdd}
                >
                  Ajouter catégorie
                </Button>
              </div>
              <Spin spinning={state.loading}>
                <Table
                  className="table-responsive"
                  columns={columns}
                  dataSource={state.categories}
                  rowKey="_id"
                  pagination={{
                    ...state.pagination,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} sur ${total} catégories`,
                  }}
                  onChange={handleTableChange}
                />
              </Spin>
            </Cards>
          </Col>
        </Row>
      </Main>

      {/* Add Category Modal */}
      <Modal
        title="Ajouter une nouvelle catégorie"
        open={state.isAddModalVisible}
        onCancel={handleCancelAdd}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmitAdd}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="Nom de la catégorie"
            rules={[{ required: true, message: 'Veuillez entrer le nom de la catégorie' }]}
          >
            <Input placeholder="Entrez le nom de la catégorie" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={state.isSubmitting}
              block
            >
              Ajouter la catégorie
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        title="Modifier la catégorie"
        open={isEditModalVisible}
        onCancel={handleCancelEdit}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmitEdit}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="Nom de la catégorie"
            rules={[{ required: true, message: 'Veuillez entrer le nom de la catégorie' }]}
          >
            <Input placeholder="Entrez le nom de la catégorie" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isEditSubmitting}
              block
            >
              Modifier la catégorie
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </CategoryListWrapper>
  );
}

export default CategoryList; 