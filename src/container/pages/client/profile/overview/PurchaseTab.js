/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Table, Button, Tag, Modal, message, Row, Col, Form, Input, InputNumber, Select, DatePicker, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, FilePdfOutlined } from '@ant-design/icons';
import FeatherIcon from 'feather-icons-react';
import html2pdf from 'html2pdf.js';

import { Cards } from '../../../../../components/cards/frame/cards-frame';

import productService from '../../../../../config/api/product.service';
import serviceService from '../../../../../config/api/service.service';
import venteService from '../../../../../config/api/vente.service';

function isMongoId(val) {
  return typeof val === 'string' && /^[a-f0-9]{24}$/.test(val);
}

const PurchaseTab = ({ clientData }) => {
  // Log clientData at render time
  console.log('PurchaseTab: clientData at render:', clientData);

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingVente, setEditingVente] = useState(null);
  const [isVenteModalVisible, setIsVenteModalVisible] = useState(false);

  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [venteLoading, setVenteLoading] = useState(false);

  // Fetch sales for this client only
  const fetchClientSales = useCallback(async () => {
    if (!clientData?._id) {
      console.warn('fetchClientSales: clientData._id is missing, skipping fetch.');
      return;
    }
    setLoading(true);
    try {
      // Use vente service instead of sales service since we're creating ventes
      const response = await venteService.getAllVentes({ customer: clientData._id });
      console.log('Ventes response:', response);
      setSales(response.ventes || response.data || []);
    } catch (error) {
      console.error('Error fetching client ventes:', error);
      const errorMessage = error.message || 'Erreur lors du chargement des achats';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [clientData?._id]);

  // Fetch products and services for the vente modal
  const fetchProductsAndServices = useCallback(async () => {
    try {
      const [productsRes, servicesRes] = await Promise.all([
        productService.getAllProducts(1, 1000),
        serviceService.getAllServices(1, 1000),
      ]);
      setProducts(productsRes.products || productsRes.data || []);
      setServices(servicesRes.services || servicesRes.data || []);
    } catch (error) {
      message.error('Erreur lors du chargement des articles ou services');
    }
  }, []);

  // Vente form state - moved before openVenteModal
  const [venteForm] = Form.useForm();
  const [paymentType, setPaymentType] = useState('comptant');
  const [installments, setInstallments] = useState([{ amount: null, date: null }]);
  const [reductionType, setReductionType] = useState('amount'); // 'amount' or 'percent'
  const [reductionValue, setReductionValue] = useState(0);
  const [total, setTotal] = useState(0);

  // Function to pre-fill form when editing a vente
  const prefillVenteForm = (vente) => {
    console.log('Pre-filling form with vente:', vente);
    
    // Set payment type
    setPaymentType(vente.paymentType || 'comptant');
    
    // Set reduction
    setReductionType('percent'); // Always percent as per backend
    setReductionValue(vente.reduction || 0);
    
    // Set installments if payment type is facilite
    if (vente.paymentType === 'facilite' && vente.installments && vente.installments.length > 0) {
      const formattedInstallments = vente.installments.map(inst => ({
        amount: parseFloat(inst.amount.$numberDecimal || inst.amount),
        date: moment(inst.dueDate)
      }));
      setInstallments(formattedInstallments);
    } else {
      setInstallments([{ amount: null, date: null }]);
    }
    
    // Prepare articles for form
    const articles = vente.articles ? vente.articles.map(article => ({
      product: article.product._id || article.product,
      quantity: article.quantity || 1
    })) : [];
    
    // Prepare services for form
    const services = vente.services ? vente.services.map(service => ({
      service: service.service._id || service.service,
      description: service.description || ''
    })) : [];
    
    // Set form values
    venteForm.setFieldsValue({
      articles,
      services,
      notes: vente.notes || ''
    });
    
    // Calculate and set total manually to avoid using calculateTotal before it's defined
    let articlesTotal = 0;
    let servicesTotal = 0;
    
    if (articles && articles.length > 0) {
      articlesTotal = articles.reduce((sum, item) => {
        if (!item || !item.product) return sum;
        const prod = products.find(p => (p._id || p.id) === item.product);
        const price = prod?.s_price?.$numberDecimal
          ? parseFloat(prod.s_price.$numberDecimal)
          : Number(prod?.s_price) || 0;
        const qty = Number(item.quantity) || 1;
        return sum + price * qty;
      }, 0);
    }
    
    if (services && services.length > 0) {
      servicesTotal = services.reduce((sum, item) => {
        if (!item || !item.service) return sum;
        const serv = services.find(s => (s._id || s.id) === item.service);
        const price = serv?.estimatedCost?.$numberDecimal
          ? parseFloat(serv.estimatedCost.$numberDecimal)
          : Number(serv?.estimatedCost) || 0;
        return sum + price;
      }, 0);
    }
    
    const totalBeforeReduction = articlesTotal + servicesTotal;
    const reduction = (totalBeforeReduction * (vente.reduction || 0)) / 100;
    const calculatedTotal = Math.max(0, totalBeforeReduction - reduction);
    
    setTotal(calculatedTotal);
  };

  const openVenteModal = (venteToEdit = null) => {
    console.log('openVenteModal called with venteToEdit:', venteToEdit);
    if (!clientData?._id) {
      message.error("Client introuvable. Veuillez recharger la page ou accéder depuis la fiche client.");
      return;
    }
    fetchProductsAndServices();
    setEditingVente(venteToEdit);
    console.log('editingVente set to:', venteToEdit);
    setIsVenteModalVisible(true);
    
    // If editing, pre-fill the form after a short delay to ensure products/services are loaded
    if (venteToEdit) {
      console.log('Pre-filling form for editing');
      setTimeout(() => {
        prefillVenteForm(venteToEdit);
      }, 100);
    } else {
      console.log('Resetting form for new vente');
      // Reset form for new vente
      venteForm.resetFields();
      setPaymentType('comptant');
      setInstallments([{ amount: null, date: null }]);
      setReductionType('amount');
      setReductionValue(0);
      setTotal(0);
    }
  };
  

  const handleVenteModalCancel = () => {
    setIsVenteModalVisible(false);
    setEditingVente(null);
    venteForm.resetFields();
    setPaymentType('comptant');
    setInstallments([{ amount: null, date: null }]);
    setReductionType('amount');
    setReductionValue(0);
    setTotal(0);
  };

  // Calculate total whenever articles, services, or reduction changes
  const calculateTotal = (values, rType = reductionType, rValue = reductionValue) => {
    let articlesTotal = 0;
    let servicesTotal = 0;
    if (values.articles) {
      articlesTotal = values.articles.reduce((sum, item) => {
        if (!item || !item.product) return sum;
        const prod = products.find(p => (p._id || p.id) === item.product);
        const price = prod?.s_price?.$numberDecimal
          ? parseFloat(prod.s_price.$numberDecimal)
          : Number(prod?.s_price) || 0;
        const qty = Number(item.quantity) || 1;
        return sum + price * qty;
      }, 0);
    }
    if (values.services) {
      servicesTotal = values.services.reduce((sum, item) => {
        if (!item || !item.service) return sum;
        const serv = services.find(s => (s._id || s.id) === item.service);
        const price = serv?.estimatedCost?.$numberDecimal
          ? parseFloat(serv.estimatedCost.$numberDecimal)
          : Number(serv?.estimatedCost) || 0;
        return sum + price;
      }, 0);
    }
    let reduction = 0;
    const totalBeforeReduction = articlesTotal + servicesTotal;
    if (rType === 'percent') {
      reduction = (totalBeforeReduction * (Number(rValue) || 0)) / 100;
    } else {
      reduction = Math.min(Number(rValue) || 0, totalBeforeReduction);
    }
    return Math.max(0, totalBeforeReduction - reduction);
  };

  const handleVenteFormChange = (_, allValues) => {
    setTotal(calculateTotal(allValues));
  };

  const handleAddInstallment = () => {
    setInstallments([...installments, { amount: null, date: null }]);
  };
  const handleRemoveInstallment = (idx) => {
    setInstallments(installments.filter((_, i) => i !== idx));
  };
  const getInstallmentsTotal = () => installments.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const remainingInstallment = paymentType === 'facilite' ? (Math.round(total * 100) / 100 - Math.round(getInstallmentsTotal() * 100) / 100) : 0;
  const handleInstallmentChange = (idx, field, value) => {
    setInstallments(installments.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  // Function to auto-adjust the last installment to match total exactly
  const autoAdjustLastInstallment = () => {
    if (paymentType === 'facilite' && installments.length > 0) {
      const currentSum = installments.slice(0, -1).reduce((sum, inst) => sum + (Number(inst.amount) || 0), 0);
      const remainingAmount = Math.round((total - currentSum) * 100) / 100;
      
      if (remainingAmount >= 0) {
        setInstallments(prev => prev.map((inst, idx) => 
          idx === prev.length - 1 ? { ...inst, amount: remainingAmount } : inst
        ));
      }
    }
  };

  // Function to redistribute installments evenly
  const redistributeInstallments = () => {
    if (paymentType === 'facilite' && installments.length > 0) {
      const equalAmount = Math.round((total / installments.length) * 100) / 100;
      const lastAmount = Math.round((total - (equalAmount * (installments.length - 1))) * 100) / 100;
      
      setInstallments(prev => prev.map((inst, idx) => ({
        ...inst,
        amount: idx === prev.length - 1 ? lastAmount : equalAmount
      })));
    }
  };

  const handleVenteSubmit = async () => {
    try {
      // Log clientData at submit time
      console.log('handleVenteSubmit: clientData at submit:', clientData);

      const clientId = clientData?._id;
      console.log('Extracted clientId:', clientId);
      
      if (!clientId) {
        message.error('Client introuvable. Veuillez réessayer depuis la fiche client.');
        return;
      }

      const values = await venteForm.validateFields();
      console.log('All form values:', values);
      console.log('Current total state:', total);

      // Validate at least one article or service
      const hasArticles = Array.isArray(values.articles) && values.articles.filter(a => a && a.product).length > 0;
      const hasServices = Array.isArray(values.services) && values.services.filter(s => s && s.service).length > 0;
      if (!hasArticles && !hasServices) {
        message.error('Veuillez ajouter au moins un article ou un service.');
        return;
      }
      // Validate paymentType
      if (!paymentType) {
        message.error('Veuillez sélectionner le type de paiement.');
        return;
      }
      // Validate installments if paymentType is 'facilite'
      if (paymentType === 'facilite') {
        const totalInstallments = installments.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
        const roundedTotal = Math.round(total * 100) / 100; // Round to 2 decimal places
        const roundedInstallments = Math.round(totalInstallments * 100) / 100;
        
        console.log('=== INSTALLMENT VALIDATION ===');
        console.log('Total before reduction:', calculateTotal(values, reductionType, 0));
        console.log('Reduction applied:', reductionValue);
        console.log('Final total after reduction:', total);
        console.log('Rounded total:', roundedTotal);
        console.log('Installments sum:', totalInstallments);
        console.log('Rounded installments:', roundedInstallments);
        console.log('Difference:', Math.abs(roundedInstallments - roundedTotal));
        console.log('=== END VALIDATION ===');
        
        // If there's a small difference, auto-adjust the last installment
        const difference = Math.abs(roundedInstallments - roundedTotal);
        if (difference > 0.001 && difference < 0.1 && installments.length > 0) {
          console.log('Auto-adjusting last installment to match total exactly');
          const lastInstallmentIndex = installments.length - 1;
          const currentSum = installments.slice(0, -1).reduce((sum, inst) => sum + (Number(inst.amount) || 0), 0);
          const adjustedAmount = Math.round((roundedTotal - currentSum) * 100) / 100;
          
          if (adjustedAmount >= 0) {
            setInstallments(prev => prev.map((inst, idx) => 
              idx === lastInstallmentIndex ? { ...inst, amount: adjustedAmount } : inst
            ));
            message.info('Montant ajusté automatiquement pour correspondre au total');
            return; // Re-run validation after adjustment
          }
        }
        
        // Use a smaller tolerance for more precise validation
        if (Math.abs(roundedInstallments - roundedTotal) > 0.001) {
          message.error(`La somme des échéances doit être égale au total à payer. Total après réduction: ${roundedTotal}, Installments: ${roundedInstallments}, Différence: ${Math.abs(roundedInstallments - roundedTotal)}`);
          return;
        }
        if (!installments.every(i => i.amount && i.date)) {
          message.error('Veuillez remplir tous les montants et dates des échéances.');
          return;
        }
      }
      // Build payload
      const servicesPayload = Array.isArray(values.services)
        ? values.services.filter(s => s && s.service).map(s => {
            const selectedService = services.find(serv => (serv._id || serv.id) === s.service);
            const serviceCost = selectedService?.estimatedCost?.$numberDecimal
              ? parseFloat(selectedService.estimatedCost.$numberDecimal)
              : Number(selectedService?.estimatedCost) || 0;
            
            const obj = {
              service: typeof s.service === 'object' ? (s.service._id || s.service.id) : s.service,
              cost: serviceCost,
            };
            if (s.description) obj.description = s.description;
            return obj;
          })
        : [];
      const articlesPayload = Array.isArray(values.articles)
        ? values.articles.filter(a => a && a.product).map(a => {
            const selectedProduct = products.find(prod => (prod._id || prod.id) === a.product);
            const productPrice = selectedProduct?.s_price?.$numberDecimal
              ? parseFloat(selectedProduct.s_price.$numberDecimal)
              : Number(selectedProduct?.s_price) || 0;
            const quantity = Number(a.quantity) || 1;
            const totalPrice = productPrice * quantity;
            
            const obj = {
              product: typeof a.product === 'object' ? (a.product._id || a.product.id) : a.product,
              quantity,
              unitPrice: productPrice,
              totalPrice,
              // Add stock information if available
              ...(selectedProduct?.stock && { stock: selectedProduct.stock }),
              ...(selectedProduct?.productName && { productName: selectedProduct.productName }),
            };
            return obj;
          })
        : [];
      // Calculate the exact sum of installments for backend
      const exactInstallmentsSum = paymentType === 'facilite' 
        ? installments.reduce((sum, inst) => sum + (Number(inst.amount) || 0), 0)
        : 0;
      
      const payload = {
        customer: clientId,
        articles: articlesPayload,
        services: servicesPayload,
        reduction: reductionType === 'amount' 
          ? Math.round((reductionValue / calculateTotal(values, reductionType, 0)) * 100 * 100) / 100 // Convert amount to percentage
          : reductionValue,
        reductionType: 'percent', // Force percentage to avoid backend bug
        paymentType,
        totalCost: paymentType === 'facilite' ? exactInstallmentsSum : Math.round(total * 100) / 100, // Use exact installments sum for facilite
        installments: paymentType === 'facilite'
          ? installments.map(i => ({
              amount: Math.round(Number(i.amount) * 100) / 100, // Round to 2 decimal places
              dueDate: i.date && i.date.format ? i.date.format('YYYY-MM-DD') : (typeof i.date === 'string' ? i.date.split('T')[0] : i.date)
            }))
          : [],
        notes: values.notes,
      };

      // Add detailed logging for debugging
      console.log('=== DETAILED CALCULATION BREAKDOWN ===');
      console.log('Articles payload:', JSON.stringify(articlesPayload, null, 2));
      console.log('Services payload:', JSON.stringify(servicesPayload, null, 2));
      console.log('Reduction type:', reductionType);
      console.log('Reduction value:', reductionValue);
      console.log('Total before reduction:', calculateTotal(values, reductionType, 0));
      console.log('Final total after reduction:', total);
      console.log('Rounded total being sent:', Math.round(total * 100) / 100);
      console.log('Installments:', JSON.stringify(installments, null, 2));
      
      // Log stock information for selected products
      console.log('=== STOCK INFORMATION ===');
      articlesPayload.forEach((article, index) => {
        const selectedProduct = products.find(prod => (prod._id || prod.id) === article.product);
        console.log(`Product ${index + 1}:`, {
          productId: article.product,
          productName: selectedProduct?.productName || selectedProduct?.title || 'Unknown',
          requestedQuantity: article.quantity,
          availableStock: selectedProduct?.stock || 'Unknown',
          hasEnoughStock: selectedProduct?.stock >= article.quantity
        });
      });
      console.log('=== END STOCK INFORMATION ===');
      
      // Manual calculation from payload data
      const manualArticlesTotal = articlesPayload.reduce((sum, article) => sum + (article.totalPrice || 0), 0);
      const manualServicesTotal = servicesPayload.reduce((sum, service) => sum + (service.cost || 0), 0);
      const manualTotalBeforeReduction = manualArticlesTotal + manualServicesTotal;
      const manualReduction = reductionType === 'percent' 
        ? (manualTotalBeforeReduction * reductionValue / 100)
        : Math.min(reductionValue, manualTotalBeforeReduction);
      const manualFinalTotal = manualTotalBeforeReduction - manualReduction;
      
      // Calculate installments sum manually
      const manualInstallmentsSum = installments.reduce((sum, inst) => sum + (Number(inst.amount) || 0), 0);
      
      console.log('=== MANUAL CALCULATION FROM PAYLOAD ===');
      console.log('Manual articles total:', manualArticlesTotal);
      console.log('Manual services total:', manualServicesTotal);
      console.log('Manual total before reduction:', manualTotalBeforeReduction);
      console.log('Manual reduction applied:', manualReduction);
      console.log('Manual final total:', manualFinalTotal);
      console.log('Manual installments sum:', manualInstallmentsSum);
      console.log('Installments breakdown:', installments.map(inst => ({ amount: Number(inst.amount), date: inst.date })));
      console.log('=== END MANUAL CALCULATION ===');
      
      console.log('Products data:', products);
      console.log('Services data:', services);
      console.log('=== END BREAKDOWN ===');

      console.log('Final API payload:', payload);
      
      // Final validation: ensure totalCost exactly matches installments sum for facilite
      if (paymentType === 'facilite') {
        const finalInstallmentsSum = payload.installments.reduce((sum, inst) => sum + inst.amount, 0);
        if (Math.abs(payload.totalCost - finalInstallmentsSum) > 0.001) {
          console.error('Final validation failed: totalCost does not match installments sum');
          console.error('totalCost:', payload.totalCost, 'installmentsSum:', finalInstallmentsSum);
          message.error('Erreur de validation: le total ne correspond pas à la somme des échéances');
          return;
        }
      }
      
      setVenteLoading(true);
      
      // Determine if we're creating or updating
      if (editingVente && editingVente._id) {
        console.log('Updating vente with ID:', editingVente._id);
        const response = await venteService.updateVente(editingVente._id, payload);
        console.log('Update API response:', response);
        message.success('Vente modifiée avec succès');
      } else if (editingVente) {
        console.error('editingVente exists but _id is missing:', editingVente);
        message.error('Erreur: ID de vente manquant');
        return;
      } else {
        console.log('Creating new vente');
        const response = await venteService.createVente(payload);
        console.log('Create API response:', response);
        message.success('Vente ajoutée avec succès');
      }
      
      setIsVenteModalVisible(false);
      setEditingVente(null);
      venteForm.resetFields();
      setInstallments([{ amount: null, date: null }]);
      setPaymentType('comptant');
      setReductionType('amount');
      setReductionValue(0);
      setTotal(0);
      fetchClientSales();
    } catch (error) {
      console.error('Erreur lors de la soumission de la vente:', error);
      console.error('Full error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.response?.data?.message);
      
      let errorMessage = 'Erreur lors de la création de la vente';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setVenteLoading(false);
    }
  };

  useEffect(() => {
    fetchClientSales();
  }, [fetchClientSales]);

  // Auto-adjust installments when remaining amount is very small
  useEffect(() => {
    if (paymentType === 'facilite' && remainingInstallment > 0 && remainingInstallment < 0.01) {
      autoAdjustLastInstallment();
    }
  }, [remainingInstallment, paymentType]);

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Supprimer cet achat ?',
      onOk: async () => {
        try {
          await venteService.deleteVente(id);
          message.success('Achat supprimé');
          fetchClientSales();
        } catch (error) {
          console.error('Error deleting vente:', error);
          const errorMessage = error.message || 'Erreur lors de la suppression';
          message.error(errorMessage);
        }
      }
    });
  };

  // Create beautiful invoice HTML template
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
              <p><strong>N° Facture:</strong> ${data.vente._id}</p>
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

  const handleDownloadInvoice = async (venteId) => {
    try {
      setVenteLoading(true);
      console.log('=== PDF DOWNLOAD DEBUG ===');
      console.log('Starting PDF download for vente:', venteId);
      
      // Get vente data from existing service
      const vente = await venteService.getVente(venteId);
      console.log('Vente data:', vente);
      
      if (!vente) {
        message.error('Vente introuvable');
        return;
      }

      // Transform data for PDF generation
      const pdfData = {
        vente: {
          _id: vente._id,
          createdAt: vente.createdAt,
          paymentType: vente.paymentType,
          reduction: vente.reduction,
          totalCost: vente.totalCost,
          installments: vente.installments || [],
          notes: vente.notes
        },
        customer: {
          name: `${clientData?.fname || ''} ${clientData?.lname || ''}`.trim(),
          cin: clientData?.cin || '',
          phoneNumber: clientData?.phoneNumber || ''
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

      console.log('PDF Data prepared:', pdfData);
      
      // Generate PDF using html2pdf
      const invoiceHTML = createInvoiceHTML(pdfData);
      
      // Generate PDF using html2pdf with direct HTML string
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
      
      console.log('PDF generated successfully!');
      
      message.success('Facture téléchargée avec succès');
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error(`Erreur lors de la génération du PDF: ${error.message}`);
    } finally {
      setVenteLoading(false);
      console.log('=== END PDF DOWNLOAD DEBUG ===');
    }
  };

  const handleEdit = (id) => {
    console.log('handleEdit called with id:', id);
    const vente = sales.find(s => s._id === id);
    console.log('Found vente:', vente);
    if (vente) {
      openVenteModal(vente);
    } else {
      console.error('Vente not found for id:', id);
      message.error('Vente introuvable');
    }
  };



  const columns = [
    {
      title: 'Articles & Services',
      dataIndex: 'items',
      key: 'items',
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
        
        return items.length > 0 ? items.join(', ') : 'N/A';
      },
    },
    {
      title: 'Réduction',
      dataIndex: 'reduction',
      key: 'reduction',
      render: (reduction) => {
        if (reduction && reduction > 0) {
          return <span style={{ color: '#52c41a', fontWeight: 'bold' }}>-{reduction}%</span>;
        }
        return <span style={{ color: '#999' }}>0%</span>;
      },
    },
    {
      title: 'Montant Total',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (amount) => {
        if (amount && amount.$numberDecimal) {
          return <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{parseFloat(amount.$numberDecimal).toLocaleString('fr-FR')} DT</span>;
        }
        if (typeof amount === 'number') {
          return <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{amount.toLocaleString('fr-FR')} DT</span>;
        }
        return 'N/A';
      },
    },
    {
      title: 'Méthode de paiement',
      dataIndex: 'paymentType',
      key: 'paymentType',
      render: (method) => {
        if (method === 'facilite') {
          return <span style={{ color: '#ff9800', fontWeight: 'bold' }}>Facilité</span>;
        }
        if (method === 'comptant') {
          return <span style={{ color: '#52c41a', fontWeight: 'bold' }}>Comptant</span>;
        }
        return method ? method.charAt(0).toUpperCase() + method.slice(1) : 'N/A';
      },
    },
    {
      title: 'Statut Paiement',
      key: 'paymentStatus',
      render: (_, record) => {
        // Calculate payment status based on installments and payment type
        let status = 'N/A';
        let style = { fontWeight: 500, fontSize: 12, borderRadius: 3, padding: '0 8px', lineHeight: '22px', height: 22, display: 'inline-block', letterSpacing: 0.5 };

        if (record.paymentType === 'comptant') {
          status = 'PAYÉ';
          style = { ...style, background: '#52c41a', color: '#fff', border: 'none' }; // green
        } else if (record.paymentType === 'facilite') {
          if (record.installments && record.installments.length > 0) {
            // Check if all installments are actually paid
            const allInstallmentsPaid = record.installments.every(inst => inst.paid === true);
            const someInstallmentsPaid = record.installments.some(inst => inst.paid === true);
            const paidInstallmentsCount = record.installments.filter(inst => inst.paid === true).length;
            const totalInstallmentsCount = record.installments.length;
            
            if (allInstallmentsPaid) {
              status = 'PAYÉ';
              style = { ...style, background: '#52c41a', color: '#fff', border: 'none' }; // green
            } else if (someInstallmentsPaid) {
              status = `EN COURS (${paidInstallmentsCount}/${totalInstallmentsCount})`;
              style = { ...style, background: '#ff9800', color: '#fff', border: 'none' }; // orange
            } else {
              status = 'EN ATTENTE';
              style = { ...style, background: '#1890ff', color: '#fff', border: 'none' }; // blue
            }
          } else {
            status = 'EN ATTENTE';
            style = { ...style, background: '#1890ff', color: '#fff', border: 'none' }; // blue
          }
        } else {
          style = { ...style, background: '#f0f0f0', color: '#333', border: '1px solid #d9d9d9' };
        }

        return (
          <Tag style={style} title={record.paymentType === 'facilite' ? `Type: ${record.paymentType} - ${status}` : `Type: ${record.paymentType}`}>
            {status}
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
            title="Modifier"
          />
          <Button
            type="default"
            icon={<FilePdfOutlined />}
            size="small"
            onClick={() => handleDownloadInvoice(record._id)}
            style={{ marginRight: 8 }}
            title="Télécharger la facture"
          />
          <Button
            type="default"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record._id)}
            title="Supprimer"
          />
        </div>
      ),
    },
  ];

  // Conditional rendering based on clientData availability
  if (!clientData || !clientData._id) {
    return (
      <Cards title="Chargement des données client..." style={{ minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
        <p style={{ marginTop: 20, fontSize: '1.1em' }}>Veuillez patienter pendant le chargement des informations du client.</p>
        <p style={{ fontSize: '0.9em', color: '#888' }}>Si le problème persiste, le client pourrait être introuvable.</p>
      </Cards>
    );
  }

  return (
    <Cards headless>
      <Row gutter={16} align="middle" style={{ marginBottom: 24, justifyContent: 'flex-end', display: 'flex' }}>
        <Col span={24} style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontWeight: 600 }}>Liste des Ventes du Client</h2>
        </Col>
        <Col>
        <Button
  type="primary"
  size="default"
  style={{
    background: !clientData?._id ? '#ccc' : '#b71c1c',
    borderColor: !clientData?._id ? '#ccc' : '#b71c1c',
    color: 'white',
    marginRight: 12,
    cursor: !clientData?._id ? 'not-allowed' : 'pointer'
  }}
  onClick={() => openVenteModal(null)}
>
  <FeatherIcon icon="plus" size={14} style={{ marginRight: 5 }} /> Affecter une vente
</Button>

        </Col>
      </Row>
      {/* Vente Modal */}
      <Modal
        title={editingVente ? "Modifier la vente" : "Affecter une vente"}
        open={isVenteModalVisible}
        onCancel={handleVenteModalCancel}
        onOk={handleVenteSubmit}
        confirmLoading={venteLoading}
        okText={editingVente ? "Modifier" : "Ajouter"}
        cancelText="Annuler"
        width={900}
      >
        <Form
          form={venteForm}
          layout="vertical"
          onValuesChange={handleVenteFormChange}
          initialValues={{
            articles: [],
            services: [],
            paymentType: 'comptant',
            reduction: 0,
          }}
        >
          <Form.List name="articles" initialValue={[]}> 
            {(fields, { add, remove }) => (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Articles</span>
                  <Button type="dashed" onClick={() => add()} icon={<FeatherIcon icon="plus" size={14} />}>Ajouter un article</Button>
                </div>
                {fields.map(field => (
                  <Row key={field.key} gutter={8} align="middle" style={{ marginBottom: 8, flexWrap: 'nowrap' }}>
                    <Col span={11}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'product']}
                        fieldKey={[field.fieldKey, 'product']}
                        rules={[{ required: true, message: 'Sélectionnez un article' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Select placeholder="Article">
                          {products.map(prod => (
                            <Select.Option key={prod._id || prod.id} value={prod._id || prod.id}>
                              {prod.title || prod.name || prod.productName || 'Article'}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={9}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'quantity']}
                        fieldKey={[field.fieldKey, 'quantity']}
                        rules={[{ required: true, message: 'Quantité requise' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber min={1} placeholder="Quantité" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Button danger onClick={() => remove(field.name)} disabled={fields.length === 1} style={{ width: '100%' }}>Supprimer</Button>
                    </Col>
                  </Row>
                ))}
              </div>
            )}
          </Form.List>
          <Form.List name="services" initialValue={[]}> 
            {(fields, { add, remove }) => (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Services</span>
                  <Button type="dashed" onClick={() => add()} icon={<FeatherIcon icon="plus" size={14} />}>Ajouter un service</Button>
                </div>
                {fields.map(field => {
                  const selectedServiceId = venteForm.getFieldValue(['services', field.name, 'service']);
                  const selectedService = services.find(s => (s._id || s.id) === selectedServiceId);
                  let rowServicePrice = 0;
                  if (selectedService) {
                    rowServicePrice = selectedService.estimatedCost?.$numberDecimal
                      ? parseFloat(selectedService.estimatedCost.$numberDecimal)
                      : Number(selectedService.estimatedCost) || 0;
                  }
                  // Deduplicate services here using reduce
                  const uniqueServices = services.reduce((acc, serv) => {
                    const id = serv._id || serv.id;
                    if (!acc.seen.has(id)) {
                      acc.seen.add(id);
                      acc.list.push(serv);
                    }
                    return acc;
                  }, { seen: new Set(), list: [] }).list;
                  return (
                    <Row key={field.key} gutter={8} align="middle" style={{ marginBottom: 8, flexWrap: 'nowrap' }}>
                      <Col span={16}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'service']}
                          fieldKey={[field.fieldKey, 'service']}
                          rules={[{ required: true, message: 'Sélectionnez un service' }]}
                          style={{ marginBottom: 0 }}
                        >
                          <Select placeholder="Service" allowClear>
                            {uniqueServices.map(serv => {
                              // Build car label
                              let carLabel = '';
                              const serviceObj = selectedService || serv; // fallback for dropdown rendering
                              if (serviceObj && serviceObj.car && typeof serviceObj.car === 'object') {
                                let brand = '';
                                if (serviceObj.car.brand && typeof serviceObj.car.brand === 'object') {
                                  brand = serviceObj.car.brand.brand_name || '';
                                } else if (serviceObj.car.brand && typeof serviceObj.car.brand === 'string' && !isMongoId(serviceObj.car.brand)) {
                                  brand = serviceObj.car.brand;
                                }
                                const model = (serviceObj.car.model_name && !isMongoId(serviceObj.car.model_name)) ? serviceObj.car.model_name
                                  : (serviceObj.car.model && !isMongoId(serviceObj.car.model)) ? serviceObj.car.model : '';
                                const plate = serviceObj.car.matricule || serviceObj.car.plate_number || '';
                                carLabel = [brand, model, plate].filter(Boolean).join(' ');
                              }
                              return (
                                <Select.Option key={serv._id || serv.id} value={serv._id || serv.id}>
                                  {`${serv.serviceType || serv.name || 'Service'}${carLabel ? ` (${carLabel})` : ''}`}
                                </Select.Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <InputNumber
                          value={rowServicePrice}
                          readOnly
                          style={{ width: '100%', background: '#f5f5f5' }}
                          placeholder="Coût"
                        />
                      </Col>
                      <Col span={4}>
                        <Button danger onClick={() => remove(field.name)} disabled={fields.length === 1} style={{ width: '100%' }}>Supprimer</Button>
                      </Col>
                    </Row>
                  );
                })}
              </div>
            )}
          </Form.List>
          <Row gutter={8} align="middle" style={{ marginTop: 16 }}>
            <Col span={12}>
              <Form.Item label="Type de réduction">
                <Select value={reductionType} onChange={val => {
                  setReductionType(val);
                  setTotal(calculateTotal(venteForm.getFieldsValue(true), val, reductionValue));
                }}>
                  <Select.Option value="amount">Montant</Select.Option>
                  <Select.Option value="percent">Pourcentage (%)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Réduction">
                <InputNumber
                  min={0}
                  max={reductionType === 'percent' ? 100 : undefined}
                  value={reductionValue}
                  onChange={val => {
                    let newVal = val;
                    const allValues = venteForm.getFieldsValue(true);
                    // Clamp montant to total before reduction
                    if (reductionType === 'amount') {
                      const totalBeforeReduction = calculateTotal(allValues, reductionType, 0);
                      if (val > totalBeforeReduction) newVal = totalBeforeReduction;
                    }
                    setReductionValue(newVal);
                    setTotal(calculateTotal(allValues, reductionType, newVal));
                  }}
                  style={{ width: '100%' }}
                  placeholder={reductionType === 'percent' ? 'Pourcentage' : 'Montant'}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Total à payer">
            <span style={{ fontWeight: 700, fontSize: 18 }}>{total.toLocaleString('fr-FR')} DT</span>
          </Form.Item>
          <Form.Item name="paymentType" label="Type de paiement" initialValue={paymentType} rules={[{ required: true, message: 'Veuillez sélectionner le type de paiement' }]}> 
            <Select
              onChange={val => setPaymentType(val)}
            >
              <Select.Option value="comptant">Comptant</Select.Option>
              <Select.Option value="facilite">Facilité</Select.Option>
            </Select>
          </Form.Item>
          {paymentType === 'facilite' && (
            <Form.Item label="Échéances">
              {installments.map((item, idx) => (
                <Row key={idx} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                  <Col span={10}>
                    <InputNumber
                      min={0}
                      value={item.amount}
                      onChange={val => handleInstallmentChange(idx, 'amount', val)}
                      placeholder="Montant"
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col span={10}>
                    <DatePicker
                      value={item.date ? (typeof item.date === 'string' ? (window.moment ? window.moment(item.date) : undefined) : item.date) : null}
                      onChange={date => handleInstallmentChange(idx, 'date', date)}
                      placeholder="Date"
                      style={{ width: '100%', height: 44, minHeight: 44, display: 'flex', alignItems: 'center' }}
                      inputReadOnly={false}
                      format="YYYY-MM-DD"
                      dropdownClassName="custom-datepicker-dropdown"
                    />
                  </Col>
                  <Col span={4}>
                    <Button danger onClick={() => handleRemoveInstallment(idx)} disabled={installments.length === 1} style={{ width: '100%' }}>Supprimer</Button>
                  </Col>
                </Row>
              ))}
              <Button type="dashed" onClick={handleAddInstallment} style={{ width: '100%' }} disabled={remainingInstallment <= 0}>Ajouter une échéance</Button>
              {/* Auto-adjust button */}
              {remainingInstallment > 0 && remainingInstallment < 1 && (
                <Button 
                  type="link" 
                  onClick={autoAdjustLastInstallment} 
                  style={{ marginTop: 8, padding: 0 }}
                >
                  Ajuster automatiquement le montant restant
                </Button>
              )}
              {/* Redistribute button */}
              {installments.length > 1 && (
                <Button 
                  type="link" 
                  onClick={redistributeInstallments} 
                  style={{ marginTop: 4, padding: 0 }}
                >
                  Répartir équitablement
                </Button>
              )}
              {/* Remaining amount display */}
              <div style={{ marginTop: 8, fontWeight: 600, fontSize: 16, color: remainingInstallment === 0 ? '#52c41a' : '#b71c1c' }}>
                Montant restant à répartir : {Math.round(remainingInstallment * 100) / 100} DT
              </div>
            </Form.Item>
          )}
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} placeholder="Notes supplémentaires" />
          </Form.Item>
        </Form>
      </Modal>
      <Table
        columns={columns}
        dataSource={sales}
        rowKey="_id"
        loading={loading}
      />


    </Cards>
  );
};

PurchaseTab.propTypes = {
  clientData: PropTypes.object.isRequired,
};

export default PurchaseTab; 