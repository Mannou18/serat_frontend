/* eslint-disable no-underscore-dangle */
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { NavLink, Switch, Route, useParams, Redirect } from 'react-router-dom';
import { Result, Skeleton, Row, Col, message } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { PageHeader } from '../../../../components/page-headers/page-headers';
import { Main } from '../../../styled';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { Button } from '../../../../components/buttons/buttons';
import { SettingWrapper } from '../../../profile/myProfile/overview/style';
import clientService from '../../../../config/api/client.service';
import AddSaleForm from '../../sales/AddSaleForm';

/* eslint-disable no-underscore-dangle */
const UserCards = lazy(() => import('../../overview/UserCard'));
const Overview = lazy(() => import('./overview/Overview'));
const Vehicles = lazy(() => import('./overview/Vehicles'));
const Contracts = lazy(() => import('./overview/Contracts'));
const ClientBio = lazy(() => import('./overview/ClientBio'));
const ServiceTab = lazy(() => import('./overview/ServiceTab'));
const PurchaseTab = lazy(() => import('./overview/PurchaseTab'));
const HistoryTab = lazy(() => import('./overview/HistoryTab'));

/* eslint-enable no-underscore-dangle */

function ClientProfile() {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saleModalVisible, setSaleModalVisible] = useState(false);
  const [saleModalLoading, setSaleModalLoading] = useState(false);
  const [saleFormResetCounter, setSaleFormResetCounter] = useState(0);

  const fetchClientData = async () => {
    try {
      const data = await clientService.getClient(id);
      setClientData(data);
    } catch (error) {
      message.error('Erreur lors du chargement des données du client');
    } finally {
      setLoading(false);
    }
  };

  const handleSaleSubmit = async (values) => {
    setSaleModalLoading(true);
    try {
      // Submit the sale (replace with actual API if needed)
      console.log('Sale submitted:', values);
      message.success('Vente ajoutée avec succès');
      setSaleModalVisible(false);
      setSaleFormResetCounter((prev) => prev + 1);
    } catch (error) {
      message.error('Erreur lors de l\'ajout de la vente');
    } finally {
      setSaleModalLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [id]);

  if (loading) {
    return (
      <Main>
        <Cards headless>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Cards>
      </Main>
    );
  }

  if (!clientData) {
    return (
      <Main>
        <Result
          status="error"
          title="Client non trouvé"
          subTitle="Le client que vous recherchez n'existe pas ou a été supprimé."
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Retour
            </Button>
          }
        />
      </Main>
    );
  }

  return (
    <>
      <PageHeader
        ghost
        title="Profil Client"
        buttons={[
          <div key="1" className="page-header-actions">
            <Button size="small" type="default" onClick={() => window.history.back()} style={{ marginRight: '8px' }}>
              <FeatherIcon icon="arrow-left" size={14} />
              Retour
            </Button>
          </div>,
        ]}
      />

      <Main>
        <Row gutter={25}>
          <Col xxl={6} lg={8} md={10} xs={24}>
            <Suspense fallback={<Skeleton avatar active paragraph={{ rows: 3 }} />}>
              <UserCards
                user={{
                  name: `${clientData.fname} ${clientData.lname}`,
                  designation: `CIN: ${clientData.cin}`,
                  // eslint-disable-next-line no-underscore-dangle
                  _id: clientData._id,
                  cin: clientData.cin,
                  phoneNumber: clientData.phoneNumber,
                }}
                onUpdate={fetchClientData}
              />
            </Suspense>
            <Suspense fallback={<Skeleton active paragraph={{ rows: 10 }} />}>
              <ClientBio clientData={clientData} />
            </Suspense>
          </Col>
          <Col xxl={18} lg={16} md={14} xs={24}>
            <SettingWrapper>
              <Suspense
                fallback={
                  <Cards headless>
                    <Skeleton active />
                  </Cards>
                }
              >
                <div className="coverWrapper">
                  <nav className="profileTab-menu">
                    <ul>
                      <li>
                        <NavLink
                          exact
                          to={`/dashboard/clients/profile/${id}/overview`}
                          activeClassName="active"
                        >
                          Vue d&apos;ensemble
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to={`/dashboard/clients/profile/${id}/vehicles`}
                          activeClassName="active"
                        >
                          Voiture
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to={`/dashboard/clients/profile/${id}/purchases`}
                          activeClassName="active"
                        >
                          Achat
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to={`/dashboard/clients/profile/${id}/services`}
                          activeClassName="active"
                        >
                          Service
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to={`/dashboard/clients/profile/${id}/contracts`}
                          activeClassName="active"
                        >
                          Contrat
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to={`/dashboard/clients/profile/${id}/history`}
                          activeClassName="active"
                        >
                          Historique
                        </NavLink>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Suspense>
              <Switch>
                <Suspense
                  fallback={
                    <Cards headless>
                      <Skeleton active paragraph={{ rows: 10 }} />
                    </Cards>
                  }
                >
                  <Route exact path="/dashboard/clients/profile/:id" render={() => <Redirect to={`/dashboard/clients/profile/${id}/overview`} />} />
                  <Route exact path="/dashboard/clients/profile/:id/overview" render={() => <Overview clientData={clientData} onlyStats />} />
                  <Route path="/dashboard/clients/profile/:id/vehicles" render={() => <Vehicles clientData={clientData} />} />
                  <Route path="/dashboard/clients/profile/:id/purchases" render={() => <PurchaseTab clientData={clientData} />} />
                  <Route path="/dashboard/clients/profile/:id/services" render={() => <ServiceTab clientData={clientData} />} />
                  <Route path="/dashboard/clients/profile/:id/contracts" render={() => <Contracts clientData={clientData} />} />
                  <Route path="/dashboard/clients/profile/:id/history" render={() => <HistoryTab clientData={clientData} />} />
                </Suspense>
              </Switch>
            </SettingWrapper>
          </Col>
        </Row>
      </Main>

      <AddSaleForm
        visible={saleModalVisible}
        onCancel={() => setSaleModalVisible(false)}
        onSubmit={handleSaleSubmit}
        loading={saleModalLoading}
        resetTrigger={saleFormResetCounter}
        initialValues={{ customer: clientData._id }} // eslint-disable-line no-underscore-dangle
        modalTitle="Nouvelle Vente"
        okText="Ajouter"
      />
    </>
  );
}

export default ClientProfile; 