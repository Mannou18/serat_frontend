/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useCallback } from 'react';
import qs from 'qs';
import { Row, Col, Table, Input, Spin, message, Popconfirm, Select, Switch, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import AddProductForm from './AddProductForm';
import { ProductListWrapper } from './style';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Button } from '../../../components/buttons/buttons';
import productService from '../../../config/api/product.service';
import { Tag } from '../../../components/tags/tags';
import categoryService from '../../../config/api/category.service';

function ProductList() {
  const [state, setState] = useState({
    searchText: '',
    pagination: {
      current: 1,
      pageSize: 10,
    },
    loading: false,
    products: [],
    total: 0,
    isAddModalVisible: false,
    isSubmitting: false,
    formResetTrigger: 0,
    categories: [],
    categoryFilter: [],
    deletedFilter: 'notDeleted',
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const fetchProducts = async (page = 1, pageSize = 10, filters = {}) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const params = {
        page,
        limit: pageSize,
      };
      if (filters.deletedFilter && filters.deletedFilter !== 'all') {
        params.isDeleted = filters.deletedFilter === 'deleted';
      }
      if (filters.categoryFilter && filters.categoryFilter.length > 0) {
        params.category = filters.categoryFilter.join(',');
      }
      if (filters.searchText) {
        params.search = filters.searchText;
      }
      const queryString = qs.stringify(params);
      const response = await productService.getAllProductsWithQuery(queryString);
      setState(prev => ({
        ...prev,
        products: response.products,
        total: response.totalProducts,
        pagination: {
          ...prev.pagination,
          current: response.currentPage,
          total: response.totalProducts,
        },
        loading: false,
      }));
    } catch (error) {
      message.error('Erreur lors du chargement des articles');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleEdit = async (record) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const product = await productService.getProduct(record._id);
      setEditingProduct(product);
      setIsEditModalVisible(true);
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      message.error('Erreur lors du chargement du produit');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDelete = async (productId) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await productService.deleteProduct(productId);
      message.success('Article supprimé avec succès');
      // Refresh the current page
      fetchProducts(state.pagination.current, state.pagination.pageSize);
    } catch (error) {
      message.error(error.message || 'Erreur lors de la suppression du Article');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleAdd = () => {
    setState(prev => ({ ...prev, isAddModalVisible: true }));
  };

  const handleCancelAdd = () => {
    setState(prev => ({ ...prev, isAddModalVisible: false }));
  };

  const handleSubmitAdd = async (values) => {
    try {
      setState(prev => ({ ...prev, isSubmitting: true }));
      
      // Format the data to match the API requirements
      const productData = {
        title: values.title,
        b_price: {
          $numberDecimal: values.b_price.toString()
        },
        s_price: {
          $numberDecimal: values.s_price.toString()
        },
        stock: values.stock,
        categories: values.categories || [] // Add categories array, empty if not selected
      };

      await productService.addProduct(productData);
      message.success('Article ajouté avec succès');
      setState(prev => ({ 
        ...prev, 
        isAddModalVisible: false,
        isSubmitting: false,
        formResetTrigger: prev.formResetTrigger + 1
      }));
      fetchProducts(state.pagination.current, state.pagination.pageSize);
    } catch (error) {
      message.error(error.message || 'Erreur lors de l\'ajout du Article');
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    setEditingProduct(null);
  };

  const handleSubmitEdit = async (values) => {
    if (!editingProduct) return;
    try {
      setIsEditSubmitting(true);
      // Format the data to match the API requirements
      const productData = {
        title: values.title,
        b_price: {
          $numberDecimal: values.b_price.toString()
        },
        s_price: {
          $numberDecimal: values.s_price.toString()
        },
        stock: values.stock,
        categories: values.categories || []
      };
      await productService.updateProduct(editingProduct._id, productData);
      message.success('Article mis à jour avec succès');
      setIsEditModalVisible(false);
      setEditingProduct(null);
      setIsEditSubmitting(false);
      fetchProducts(state.pagination.current, state.pagination.pageSize);
    } catch (error) {
      message.error(error.message || 'Erreur lors de la mise à jour de l\'article');
      setIsEditSubmitting(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch categories for filter
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAllCategories();
        setState(prev => ({ ...prev, categories: Array.isArray(data) ? data : data.categories || [] }));
      } catch (error) {
        // ignore
      }
    };
    fetchCategories();
  }, []);

  // On filter change, fetch with filters
  useEffect(() => {
    fetchProducts(1, state.pagination.pageSize, {
      categoryFilter: state.categoryFilter,
      deletedFilter: state.deletedFilter,
      searchText: state.searchText,
    });
  }, [state.categoryFilter, state.deletedFilter, state.searchText]);

  const columns = [
    {
      title: 'Nom du Article',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Prix d'achat",
      dataIndex: 'b_price',
      key: 'b_price',
      sorter: (a, b) => parseFloat(a.b_price.$numberDecimal) - parseFloat(b.b_price.$numberDecimal),
      render: (price) => `${parseFloat(price.$numberDecimal).toFixed(2)} DT`,
    },
    {
      title: 'Prix de vente',
      dataIndex: 's_price',
      key: 's_price',
      sorter: (a, b) => parseFloat(a.s_price.$numberDecimal) - parseFloat(b.s_price.$numberDecimal),
      render: (price) => `${parseFloat(price.$numberDecimal).toFixed(2)} DT`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: 'Catégorie(s)',
      dataIndex: 'categories',
      key: 'categories',
      render: (categories) =>
        Array.isArray(categories) && categories.length > 0 ? (
          <>
            {categories.map(cat => (
              <Tag key={cat._id} color={cat.isDeleted ? '#b72025' : '#343a40'}>{cat.title}</Tag>
            ))}
          </>
        ) : (
          '—'
        ),
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
            title="Êtes-vous sûr de vouloir supprimer cet article ?"
            description="Cette action est irréversible."
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

  const debouncedSearch = useCallback(
    debounce((value) => {
      setState(prev => ({
        ...prev,
        searchText: value,
        pagination: {
          ...prev.pagination,
          current: 1,
        },
      }));
    }, 300),
    []
  );

  const handleSearch = (value) => {
    debouncedSearch(value);
  };

  const handleTableChange = (pagination) => {
    fetchProducts(pagination.current, pagination.pageSize, {
      categoryFilter: state.categoryFilter,
      deletedFilter: state.deletedFilter,
      searchText: state.searchText,
    });
  };

  const handleCategoryFilter = (value) => {
    setState(prev => ({ ...prev, categoryFilter: value }));
  };

  const handleDeletedFilter = (value) => {
    setState(prev => ({ ...prev, deletedFilter: value }));
  };

  // No client-side filtering for category/deleted
  const filteredData = state.products;

  return (
    <ProductListWrapper>
      <PageHeader
        ghost
        title="Mes articles"
      />
      <Main>
        <Row gutter={15}>
          <Col xs={24}>
            <Cards>
              <div className="search-box" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <Select
                  allowClear
                  mode="multiple"
                  placeholder="Filtrer par catégorie"
                  style={{ width: 220 }}
                  value={state.categoryFilter}
                  onChange={handleCategoryFilter}
                >
                  {state.categories.map(cat => (
                    <Select.Option key={cat._id} value={cat._id}>{cat.title}</Select.Option>
                  ))}
                </Select>
                <Input
                  placeholder="Rechercher des articles..."
                  style={{ width: 220 }}
                  onChange={e => handleSearch(e.target.value)}
                  allowClear
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#343a40' }}>Existants</span>
                  <Switch
                    checked={state.deletedFilter === 'deleted'}
                    onChange={(checked) => handleDeletedFilter(checked ? 'deleted' : 'notDeleted')}
                    style={{ backgroundColor: state.deletedFilter === 'deleted' ? '#b71c1c' : undefined, borderColor: '#b71c1c' }}
                  />
                  <span style={{ color: '#343a40' }}>Supprimés</span>
                </div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ background: '#b71c1c', borderColor: '#b71c1c', color: '#fff', fontWeight: 600 }}
                  onClick={handleAdd}
                >
                   Ajouter un article
                </Button>
              </div>
              <Spin spinning={state.loading}>
                <Table
                  className="table-responsive"
                  columns={columns}
                  dataSource={filteredData}
                  rowKey="_id"
                  pagination={{
                    ...state.pagination,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} sur ${total} articles`,
                  }}
                  onChange={handleTableChange}
                />
              </Spin>
            </Cards>
          </Col>
        </Row>
      </Main>
      <AddProductForm
        visible={state.isAddModalVisible}
        onCancel={handleCancelAdd}
        onSubmit={handleSubmitAdd}
        loading={state.isSubmitting}
        resetTrigger={state.formResetTrigger}
      />
      <AddProductForm
        visible={isEditModalVisible}
        onCancel={handleCancelEdit}
        onSubmit={handleSubmitEdit}
        loading={isEditSubmitting}
        resetTrigger={0}
        initialValues={editingProduct ? {
          title: editingProduct.title,
          b_price: parseFloat(editingProduct.b_price?.$numberDecimal || editingProduct.b_price),
          s_price: parseFloat(editingProduct.s_price?.$numberDecimal || editingProduct.s_price),
          stock: editingProduct.stock,
          categories: editingProduct.categories?.map(cat => cat._id || cat) || []
        } : {}}
        modalTitle={editingProduct ? editingProduct.title : 'Modifier un article'}
        okText="Mettre à jour"
      />
    </ProductListWrapper>
  );
}

export default ProductList; 