import React, { useState, useEffect } from 'react';
import { Table, Card, Row, Col, Input, Select, DatePicker, Button, Tag, Space, Statistic, message } from 'antd';
import { SearchOutlined, FilePdfOutlined, DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import moment from 'moment';
import html2pdf from 'html2pdf.js';

import { Cards } from '../../../components/cards/frame/cards-frame';
import venteService from '../../../config/api/vente.service';
import clientService from '../../../config/api/client.service';

const { RangePicker } = DatePicker;
const { Option } = Select;

// Invoice HTML template (reused from PurchaseTab)
const createInvoiceHTML = (data) => {
  // Calculate totals properly with better data handling
  const articlesTotal = data.articles.reduce((sum, art) => {
    const totalPrice = art.totalPrice?.$numberDecimal || art.totalPrice || 0;
    return sum + parseFloat(totalPrice);
  }, 0);
  
  const servicesTotal = data.services.reduce((sum, srv) => {
    const cost = srv.cost?.$numberDecimal || srv.cost || 0;
    return sum + parseFloat(cost);
  }, 0);
  
  const subtotal = articlesTotal + servicesTotal;
  const reduction = parseFloat(data.vente.reduction || 0);
  const total = parseFloat(data.vente.totalCost?.$numberDecimal || data.vente.totalCost || 0);
  
  // Extract ID to avoid ESLint warning
  const venteId = data.vente._id; // eslint-disable-line no-underscore-dangle
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Facture de Vente - SeratElectronics</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
          padding: 20px;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #d32f2f;
          padding-bottom: 20px;
        }
        
        .header h1 {
          color: #d32f2f;
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .company-name {
          color: #000;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .info-box {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .info-box h3 {
          color: #d32f2f;
          margin-bottom: 10px;
          font-size: 16px;
          border-bottom: 2px solid #d32f2f;
          padding-bottom: 5px;
        }
        
        .info-box p {
          margin: 5px 0;
          font-size: 14px;
          color: #333;
        }
        
        .section {
          margin: 25px 0;
        }
        
        .section h3 {
          color: #d32f2f;
          border-bottom: 2px solid #d32f2f;
          padding-bottom: 5px;
          margin-bottom: 15px;
          font-size: 18px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          background: white;
        }
        
        th {
          background: #d32f2f;
          color: white;
          padding: 12px 8px;
          text-align: left;
          font-weight: bold;
          font-size: 14px;
        }
        
        td {
          padding: 12px 8px;
          border-bottom: 1px solid #eee;
          font-size: 14px;
        }
        
        tr:nth-child(even) {
          background: #f8f9fa;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-center {
          text-align: center;
        }
        
        .total-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border: 2px solid #d32f2f;
        }
        
        .total-section h2 {
          color: #d32f2f;
          text-align: right;
          font-size: 24px;
          margin: 0;
        }
        
        .total-section p {
          text-align: right;
          margin: 5px 0;
          font-size: 16px;
          color: #333;
        }
        
        .installments {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
          border: 1px solid #d32f2f;
        }
        
        .installments h3 {
          color: #d32f2f;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .notes {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
          border: 1px solid #d32f2f;
        }
        
        .notes h3 {
          color: #d32f2f;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          color: #666;
        }
        
        @media print {
          body { margin: 0; }
          .invoice-container { max-width: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <h1>FACTURE DE VENTE</h1>
          <div class="company-name">SeratElectronics</div>
          <p style="color: #666;">Système de Gestion</p>
        </div>
        
        <!-- Info Grid -->
        <div class="info-grid">
          <div class="info-box">
            <h3>📋 Informations Facture</h3>
            <p><strong>N° Facture:</strong> ${venteId}</p>
            <p><strong>Date:</strong> ${new Date(data.vente.createdAt).toLocaleDateString('fr-FR')}</p>
            <p><strong>Heure:</strong> ${new Date(data.vente.createdAt).toLocaleTimeString('fr-FR')}</p>
            <p><strong>Type de paiement:</strong> ${data.vente.paymentType}</p>
          </div>
          
          <div class="info-box">
            <h3>👤 Client</h3>
            <p><strong>Nom:</strong> ${data.customer.name}</p>
            <p><strong>CIN:</strong> ${data.customer.cin}</p>
            <p><strong>Téléphone:</strong> ${data.customer.phoneNumber}</p>
          </div>
        </div>
        
        <!-- Articles -->
        ${data.articles && data.articles.length > 0 ? `
          <div class="section">
            <h3>📦 Articles</h3>
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th class="text-center">Quantité</th>
                  <th class="text-right">Prix Unit.</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${data.articles.map(art => {
                  const unitPrice = art.unitPrice?.$numberDecimal || art.unitPrice || 0;
                  const totalPrice = art.totalPrice?.$numberDecimal || art.totalPrice || 0;
                  return `
                    <tr>
                      <td>${art.product.title}</td>
                      <td class="text-center">${art.quantity}</td>
                      <td class="text-right">${parseFloat(unitPrice).toFixed(2)} DT</td>
                      <td class="text-right">${parseFloat(totalPrice).toFixed(2)} DT</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        ` : '<div class="section"><h3>📦 Articles</h3><p>Aucun article</p></div>'}
        
        <!-- Services -->
        ${data.services && data.services.length > 0 ? `
          <div class="section">
            <h3>🔧 Services</h3>
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Description</th>
                  <th class="text-right">Coût</th>
                </tr>
              </thead>
              <tbody>
                ${data.services.map(srv => {
                  const cost = srv.cost?.$numberDecimal || srv.cost || 0;
                  return `
                    <tr>
                      <td>${srv.service.title}</td>
                      <td>${srv.description || ''}</td>
                      <td class="text-right">${parseFloat(cost).toFixed(2)} DT</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        ` : '<div class="section"><h3>🔧 Services</h3><p>Aucun service</p></div>'}
        
        <!-- Financial Summary -->
        <div class="total-section">
          <p><strong>Sous-total:</strong> ${subtotal.toFixed(2)} DT</p>
          ${reduction > 0 ? `<p><strong>Réduction:</strong> ${reduction.toFixed(2)} DT</p>` : ''}
          <h2>Total: ${total.toFixed(2)} DT</h2>
        </div>
        
        <!-- Installments -->
        ${data.vente.installments && data.vente.installments.length > 0 ? `
          <div class="installments">
            <h3>📅 Échéances</h3>
            ${data.vente.installments.map((inst, idx) => {
              // Handle different possible data structures for amount
              let amount = 0;
              if (typeof inst.amount === 'number') {
                amount = inst.amount;
              } else if (inst.amount?.$numberDecimal) {
                amount = parseFloat(inst.amount.$numberDecimal);
              } else if (typeof inst.amount === 'string') {
                amount = parseFloat(inst.amount);
              } else {
                amount = 0;
              }
              
              // Ensure amount is a valid number
              if (Number.isNaN(amount)) {
                amount = 0;
              }
              
              return `
                <p style="margin: 5px 0;">
                  <strong>${idx + 1}.</strong> ${amount.toFixed(2)} DT - 
                  ${new Date(inst.dueDate).toLocaleDateString('fr-FR')}
                </p>
              `;
            }).join('')}
          </div>
        ` : ''}
        
        <!-- Notes -->
        ${data.vente.notes ? `
          <div class="notes">
            <h3>📝 Notes</h3>
            <p>${data.vente.notes}</p>
          </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="footer">
          <p>Merci pour votre achat!</p>
          <p style="font-size: 12px; margin-top: 10px;">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const Comptabilite = () => {
  const [ventes, setVentes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: null,
    customer: null,
    paymentType: null,
    search: '',
  });

  // Ensure customers is always an array
  const safeCustomers = Array.isArray(customers) ? customers : [];

  // Define all functions first
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all ventes
      const ventesResponse = await venteService.getAllVentes();
      const ventesData = Array.isArray(ventesResponse) 
        ? ventesResponse 
        : (ventesResponse?.ventes || ventesResponse?.data || []);
      
      // Fetch all customers for filter
      const customersResponse = await clientService.getAllClients(1, 1000); // Get more customers
      const customersData = Array.isArray(customersResponse) 
        ? customersResponse 
        : (customersResponse?.clients || customersResponse?.data || customersResponse?.customers || []);
      
      setVentes(ventesData);
      setCustomers(customersData);
      
      if (ventesData.length === 0) {
        message.warning('Aucune vente trouvée');
      }
      if (customersData.length === 0) {
        message.warning('Aucun client trouvé');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error(`Erreur lors du chargement des données: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadInvoice = async (venteId) => {
    try {
      // Reuse the PDF generation logic from PurchaseTab
      const vente = await venteService.getVente(venteId);
      if (!vente) {
        message.error('Vente introuvable');
        return;
      }

      // Transform data for PDF generation
      const pdfData = {
        vente: {
          _id: vente._id, // eslint-disable-line no-underscore-dangle
          createdAt: vente.createdAt,
          paymentType: vente.paymentType,
          reduction: vente.reduction,
          totalCost: vente.totalCost,
          installments: vente.installments || [],
          notes: vente.notes
        },
        customer: {
          name: `${vente.customer?.fname || ''} ${vente.customer?.lname || ''}`.trim(),
          cin: vente.customer?.cin || '',
          phoneNumber: vente.customer?.phoneNumber || ''
        },
        articles: (vente.articles || []).map(article => ({
          product: {
            title: article.product?.title || article.product?.productName || 'Article'
          },
          quantity: article.quantity || 1,
          unitPrice: parseFloat(article.unitPrice?.$numberDecimal || article.unitPrice || 0),
          totalPrice: parseFloat(article.totalPrice?.$numberDecimal || article.totalPrice || 0)
        })),
        services: (vente.services || []).map(service => ({
          service: {
            title: service.service?.serviceType || service.service?.name || 'Service'
          },
          description: service.description || '',
          cost: parseFloat(service.cost?.$numberDecimal || service.cost || 0)
        }))
      };

      // Generate PDF using html2pdf
      const invoiceHTML = createInvoiceHTML(pdfData);
      
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `invoice-${venteId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };
      
      await html2pdf()
        .set(opt)
        .from(invoiceHTML)
        .save();

      message.success('Facture téléchargée avec succès');
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error('Erreur lors de la génération du PDF');
    }
  };

  const handleExportData = (record) => {
    // Export individual transaction data
    const dataStr = JSON.stringify(record, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transaction-${record._id}.json`; // eslint-disable-line no-underscore-dangle
    link.click();
    URL.revokeObjectURL(url);
    message.success('Données exportées avec succès');
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: null,
      customer: null,
      paymentType: null,
      search: '',
    });
  };

  // Filter ventes based on current filters
  const getFilteredVentes = () => {
    let filtered = [...ventes];

    // Date range filter
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      filtered = filtered.filter(vente => {
        const venteDate = moment(vente.createdAt);
        return venteDate.isBetween(startDate, endDate, 'day', '[]');
      });
    }

    // Customer filter
    if (filters.customer) {
      filtered = filtered.filter(vente => {
        const customerId = vente.customer?._id || vente.customer?.id || vente.customer; // eslint-disable-line no-underscore-dangle
        return customerId === filters.customer;
      });
    }

    // Payment type filter
    if (filters.paymentType) {
      filtered = filtered.filter(vente => vente.paymentType === filters.paymentType);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(vente => {
        const customerName = `${vente.customer?.fname || ''} ${vente.customer?.lname || ''}`.toLowerCase();
        const venteId = vente._id?.toLowerCase() || ''; // eslint-disable-line no-underscore-dangle
        return customerName.includes(searchLower) || venteId.includes(searchLower);
      });
    }

    return filtered;
  };

  // Calculate statistics
  const calculateStats = () => {
    const filtered = getFilteredVentes();
    
    const totalRevenue = filtered.reduce((sum, vente) => {
      const amount = parseFloat(vente.totalCost?.$numberDecimal || vente.totalCost || 0);
      return sum + amount;
    }, 0);
    
    const comptantRevenue = filtered
      .filter(vente => vente.paymentType === 'comptant')
      .reduce((sum, vente) => {
        const amount = parseFloat(vente.totalCost?.$numberDecimal || vente.totalCost || 0);
        return sum + amount;
      }, 0);
    
    const faciliteRevenue = filtered
      .filter(vente => vente.paymentType === 'facilite')
      .reduce((sum, vente) => {
        const amount = parseFloat(vente.totalCost?.$numberDecimal || vente.totalCost || 0);
        return sum + amount;
      }, 0);
    
    return {
      totalRevenue,
      comptantRevenue,
      faciliteRevenue,
      totalTransactions: filtered.length,
    };
  };

  const stats = calculateStats();
  const filteredVentes = getFilteredVentes();

  // Table columns
  const columns = [
    {
      title: 'N° Facture',
      dataIndex: '_id', // eslint-disable-line no-underscore-dangle
      key: '_id', // eslint-disable-line no-underscore-dangle
      width: 200,
      render: (id) => <span style={{ fontFamily: 'monospace' }}>{id}</span>,
    },
    {
      title: 'Client',
      dataIndex: 'customer',
      key: 'customer',
      width: 150,
      render: (customer) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {customer?.fname} {customer?.lname}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {customer?.phoneNumber}
          </div>
        </div>
      ),
    },
    {
      title: 'Articles & Services',
      key: 'items',
      width: 200,
      render: (_, record) => {
        const items = [];
        
        // Add articles
        if (record.articles && Array.isArray(record.articles)) {
          record.articles.forEach(item => {
            if (item.product) {
              const productName = item.product.title || item.product.name || 'Article';
              items.push(`${productName} (x${item.quantity || 1})`);
            }
          });
        }
        
        // Add services
        if (record.services && Array.isArray(record.services)) {
          record.services.forEach(item => {
            if (item.service) {
              const serviceType = item.service.serviceType || 'Service';
              items.push(serviceType);
            }
          });
        }
        
        return (
          <div style={{ maxWidth: '200px' }}>
            {items.slice(0, 2).join(', ')}
            {items.length > 2 && <span style={{ color: '#666' }}> +{items.length - 2} autres</span>}
          </div>
        );
      },
    },
    {
      title: 'Montant',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 120,
      render: (amount) => {
        const total = parseFloat(amount?.$numberDecimal || amount || 0);
        return (
          <span style={{ fontWeight: 'bold', color: '#d32f2f' }}>
            {total.toFixed(2)} DT
          </span>
        );
      },
    },
    {
      title: 'Réduction',
      dataIndex: 'reduction',
      key: 'reduction',
      width: 100,
      render: (reduction) => {
        if (reduction && reduction > 0) {
          return <span style={{ color: '#52c41a' }}>-{reduction}%</span>;
        }
        return <span style={{ color: '#999' }}>0%</span>;
      },
    },
    {
      title: 'Type de paiement',
      dataIndex: 'paymentType',
      key: 'paymentType',
      width: 100,
      render: (type) => {
        const isComptant = type === 'comptant';
        const tagStyle = { 
          fontWeight: 'bold', 
          fontSize: '10px',
          padding: '2px 6px',
          borderRadius: '3px',
          textTransform: 'uppercase',
          backgroundColor: isComptant ? '#52c41a' : '#fa8c16',
          color: 'white',
          border: 'none',
          cursor: 'default',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
        };
        const text = isComptant ? 'COMPTANT' : 'FACILITÉ';
        return <Tag style={tagStyle}>{text}</Tag>;
      },
    },
    {
      title: 'Statut Paiement',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const tagStyle = { 
          fontWeight: 'bold', 
          fontSize: '10px',
          padding: '2px 6px',
          borderRadius: '3px',
          textTransform: 'uppercase',
          color: 'white',
          border: 'none',
          cursor: 'default',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
        };

        if (record.paymentType === 'comptant') {
          return <Tag style={{ ...tagStyle, backgroundColor: '#52c41a' }}>PAYÉ</Tag>;
        }
        
        // Check if all installments are paid
        const totalInstallments = record.installments?.length || 0;
        const paidInstallments = record.installments?.filter(inst => inst.paid === true)?.length || 0;
        
        if (paidInstallments === 0) {
          return <Tag style={{ ...tagStyle, backgroundColor: '#ff4d4f' }}>EN ATTENTE</Tag>;
        }
        if (paidInstallments < totalInstallments) {
          return <Tag style={{ ...tagStyle, backgroundColor: '#fa8c16' }}>EN COURS ({paidInstallments}/{totalInstallments})</Tag>;
        }
        return <Tag style={{ ...tagStyle, backgroundColor: '#52c41a' }}>PAYÉ</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<FilePdfOutlined />} 
            size="small"
            onClick={() => handleDownloadInvoice(record._id)} // eslint-disable-line no-underscore-dangle
          />
          <Button 
            type="text" 
            icon={<DownloadOutlined />} 
            size="small"
            onClick={() => handleExportData(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Cards title="Comptabilité - Gestion des Revenus">
        {/* Statistics Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Revenu Total"
                value={loading ? 0 : stats.totalRevenue}
                precision={2}
                valueStyle={{ color: '#d32f2f' }}
                suffix="DT"
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Paiements Comptant"
                value={loading ? 0 : stats.comptantRevenue}
                precision={2}
                valueStyle={{ color: '#52c41a' }}
                suffix="DT"
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Paiements Facilité"
                value={loading ? 0 : stats.faciliteRevenue}
                precision={2}
                valueStyle={{ color: '#fa8c16' }}
                suffix="DT"
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Transactions"
                value={loading ? 0 : stats.totalTransactions}
                valueStyle={{ color: '#1890ff' }}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={6}>
              <RangePicker
                placeholder={['Date début', 'Date fin']}
                value={filters.dateRange}
                onChange={(dates) => handleFilterChange('dateRange', dates)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="Client"
                value={filters.customer}
                onChange={(value) => handleFilterChange('customer', value)}
                allowClear
                style={{ width: '100%' }}
                showSearch
                loading={loading}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                notFoundContent={loading ? "Chargement..." : "Aucun client trouvé"}
              >
                {safeCustomers.map(customer => (
                  <Option key={customer._id} value={customer._id}> {/* eslint-disable-line no-underscore-dangle */}
                    {customer.fname} {customer.lname} - {customer.phoneNumber}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="Type de paiement"
                value={filters.paymentType}
                onChange={(value) => handleFilterChange('paymentType', value)}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value="comptant">Comptant</Option>
                <Option value="facilite">Facilité</Option>
              </Select>
            </Col>
            <Col span={6}>
              <Input
                placeholder="Rechercher..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </Col>
            <Col span={4}>
              <Space>
                <Button 
                  icon={<FilterOutlined />} 
                  onClick={clearFilters}
                >
                  Effacer
                </Button>
                <Button 
                  icon={<SearchOutlined />} 
                  onClick={fetchData}
                  loading={loading}
                >
                  Actualiser
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Transactions Table */}
        <Card title={`Liste des Ventes (${filteredVentes.length} transactions)`}>
          <Table
            columns={columns}
            dataSource={filteredVentes}
            loading={loading}
            rowKey="_id" // eslint-disable-line no-underscore-dangle
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} transactions`,
            }}
            scroll={{ x: 1200, y: 400 }}
            size="small"
            locale={{
              emptyText: loading ? 'Chargement...' : 'Aucune vente trouvée',
            }}
          />
        </Card>
      </Cards>
    </div>
  );
};

export default Comptabilite; 