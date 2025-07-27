import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Divider } from 'antd';
import FeatherIcon from 'feather-icons-react';
import moment from 'moment';
import Heading from '../../../../../components/heading/heading';
import { Button } from '../../../../../components/buttons/buttons';

const VenteInvoice = ({ vente, clientData, onClose, onPrint, onDownload }) => {
  // Calculate totals
  const articlesTotal = (vente.articles || []).reduce((sum, article) => {
    return sum + parseFloat(article.totalPrice?.$numberDecimal || article.totalPrice || 0);
  }, 0);

  const servicesTotal = (vente.services || []).reduce((sum, service) => {
    return sum + parseFloat(service.cost?.$numberDecimal || service.cost || 0);
  }, 0);

  const subtotal = articlesTotal + servicesTotal;
  const reduction = parseFloat(vente.reduction || 0);
  const reductionAmount = (subtotal * reduction) / 100;
  const total = subtotal - reductionAmount;

  const printInvoice = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="invoice-container" style={{ 
      background: 'white', 
      padding: '40px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      lineHeight: '1.6'
    }}>
      
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        borderBottom: '3px solid #1890ff',
        paddingBottom: '20px'
      }}>
        <Heading as="h1" style={{ 
          color: '#1890ff', 
          fontSize: '32px',
          marginBottom: '10px',
          fontWeight: 'bold'
        }}>
          FACTURE DE VENTE
        </Heading>
        <div style={{ color: '#666', fontSize: '16px' }}>
          Serat Auto - Votre partenaire de confiance
        </div>
      </div>

      {/* Invoice Info & Client */}
      <Row gutter={24} style={{ marginBottom: '30px' }}>
        <Col span={12}>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <Heading as="h4" style={{ 
              marginBottom: '15px', 
              color: '#333',
              fontSize: '18px'
            }}>
              📋 Informations de la Facture
            </Heading>
            <div style={{ fontSize: '14px' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>N° Facture:</strong> {vente.id || vente._id /* eslint-disable-line no-underscore-dangle */}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Date:</strong> {moment(vente.createdAt).format('DD/MM/YYYY')}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Heure:</strong> {moment(vente.createdAt).format('HH:mm')}
              </div>
              <div>
                <strong>Type de paiement:</strong> {
                  vente.paymentType === 'comptant' ? 'Comptant' : 'Facilité'
                }
              </div>
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <Heading as="h4" style={{ 
              marginBottom: '15px', 
              color: '#333',
              fontSize: '18px'
            }}>
              👤 Client
            </Heading>
            <div style={{ fontSize: '14px' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Nom:</strong> {clientData?.fname} {clientData?.lname}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>CIN:</strong> {clientData?.cin}
              </div>
              <div>
                <strong>Téléphone:</strong> {clientData?.phoneNumber}
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Articles Section */}
      {vente.articles && vente.articles.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <Heading as="h3" style={{ 
            marginBottom: '15px', 
            color: '#1890ff',
            fontSize: '20px',
            borderBottom: '2px solid #1890ff',
            paddingBottom: '8px'
          }}>
            📦 Articles
          </Heading>
          <div style={{ 
            background: 'white', 
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                    Article
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                    Quantité
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                    Prix Unitaire
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {vente.articles.map((article, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f3f4' }}>
                    <td style={{ padding: '12px', textAlign: 'left' }}>
                      <div style={{ fontWeight: 'bold' }}>
                        {article.product.title || article.product.productName || 'Article'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Ref: {article.product.id || article.product}
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {article.quantity}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {parseFloat(article.unitPrice?.$numberDecimal || article.unitPrice || 0).toLocaleString('fr-FR')} DT
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                      {parseFloat(article.totalPrice?.$numberDecimal || article.totalPrice || 0).toLocaleString('fr-FR')} DT
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Services Section */}
      {vente.services && vente.services.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <Heading as="h3" style={{ 
            marginBottom: '15px', 
            color: '#52c41a',
            fontSize: '20px',
            borderBottom: '2px solid #52c41a',
            paddingBottom: '8px'
          }}>
            🔧 Services
          </Heading>
          <div style={{ 
            background: 'white', 
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                    Service
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                    Description
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                    Coût
                  </th>
                </tr>
              </thead>
              <tbody>
                {vente.services.map((service, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f3f4' }}>
                    <td style={{ padding: '12px', textAlign: 'left' }}>
                      <div style={{ fontWeight: 'bold' }}>
                        {service.service.serviceType || service.service.name || 'Service'}
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'left' }}>
                      {service.description || '-'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                      {parseFloat(service.cost?.$numberDecimal || service.cost || 0).toLocaleString('fr-FR')} DT
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        marginBottom: '30px'
      }}>
        <Row gutter={24}>
          <Col span={12}>
            <div style={{ fontSize: '16px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '10px' 
              }}>
                <span>Sous-total:</span>
                <span>{subtotal.toLocaleString('fr-FR')} DT</span>
              </div>
              {reduction > 0 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '10px',
                  color: '#52c41a'
                }}>
                  <span>Réduction ({reduction}%):</span>
                  <span>-{reductionAmount.toLocaleString('fr-FR')} DT</span>
                </div>
              )}
              <Divider style={{ margin: '15px 0' }} />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1890ff'
              }}>
                <span>Total:</span>
                <span>{total.toLocaleString('fr-FR')} DT</span>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Installments */}
      {vente.paymentType === 'facilite' && vente.installments && vente.installments.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <Heading as="h3" style={{ 
            marginBottom: '15px', 
            color: '#fa8c16',
            fontSize: '20px',
            borderBottom: '2px solid #fa8c16',
            paddingBottom: '8px'
          }}>
            📅 Échéances de Paiement
          </Heading>
          <div style={{ 
            background: '#fff7e6', 
            border: '1px solid #ffd591',
            borderRadius: '8px',
            padding: '20px'
          }}>
            {vente.installments.map((installment, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '10px',
                padding: '8px 0',
                borderBottom: index < vente.installments.length - 1 ? '1px solid #ffe7ba' : 'none'
              }}>
                <span style={{ fontWeight: 'bold' }}>
                  Échéance {index + 1}:
                </span>
                <span>
                  {parseFloat(installment.amount?.$numberDecimal || installment.amount || 0).toLocaleString('fr-FR')} DT
                  {' - '}
                  {moment(installment.dueDate).format('DD/MM/YYYY')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {vente.notes && (
        <div style={{ marginBottom: '30px' }}>
          <Heading as="h3" style={{ 
            marginBottom: '15px', 
            color: '#722ed1',
            fontSize: '20px',
            borderBottom: '2px solid #722ed1',
            paddingBottom: '8px'
          }}>
            📝 Notes
          </Heading>
          <div style={{ 
            background: '#f9f0ff', 
            border: '1px solid #d3adf7',
            borderRadius: '8px',
            padding: '20px',
            fontSize: '14px'
          }}>
            {vente.notes}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '3px solid #1890ff'
      }}>
        <div style={{ 
          fontSize: '18px', 
          color: '#1890ff', 
          fontWeight: 'bold',
          marginBottom: '10px'
        }}>
          Merci pour votre confiance !
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Serat Auto - Votre partenaire de confiance
        </div>
      </div>

      {/* Actions */}
      <div style={{ 
        marginTop: '30px', 
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        gap: '15px'
      }}>
        <Button 
          size="large" 
          shape="round" 
          type="default" 
          onClick={printInvoice}
          icon={<FeatherIcon icon="printer" size={16} />}
          style={{ padding: '8px 20px' }}
        >
          Imprimer
        </Button>
        {onDownload && (
          <Button 
            size="large" 
            shape="round" 
            type="primary" 
            onClick={onDownload}
            icon={<FeatherIcon icon="download" size={16} />}
            style={{ padding: '8px 20px' }}
          >
            Télécharger PDF
          </Button>
        )}
        {onClose && (
          <Button 
            size="large" 
            shape="round" 
            type="default" 
            onClick={onClose}
            style={{ padding: '8px 20px' }}
          >
            Fermer
          </Button>
        )}
      </div>
    </div>
  );
};

VenteInvoice.propTypes = {
  vente: PropTypes.shape({
    id: PropTypes.string,
    // eslint-disable-next-line no-underscore-dangle
    _id: PropTypes.string,
    articles: PropTypes.array,
    services: PropTypes.array,
    reduction: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    paymentType: PropTypes.string,
    installments: PropTypes.array,
    notes: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }).isRequired,
  clientData: PropTypes.shape({
    fname: PropTypes.string,
    lname: PropTypes.string,
    cin: PropTypes.string,
    phoneNumber: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func,
  onPrint: PropTypes.func,
  onDownload: PropTypes.func,
};

VenteInvoice.defaultProps = {
  onClose: null,
  onPrint: null,
  onDownload: null,
};

export default VenteInvoice; 