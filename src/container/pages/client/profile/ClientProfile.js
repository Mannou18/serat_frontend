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

/* eslint-disable no-underscore-dangle */
const UserCards = lazy(() => import('../../overview/UserCard'));
const Overview = lazy(() => import('./overview/Overview'));
const Vehicles = lazy(() => import('./overview/Vehicles'));
const Contracts = lazy(() => import('./overview/Contracts'));
const ClientBio = lazy(() => import('./overview/ClientBio'));
const PurchaseTab = lazy(() => import('./overview/PurchaseTab'));
const HistoryTab = lazy(() => import('./overview/HistoryTab'));

/* eslint-enable no-underscore-dangle */

function ClientProfile() {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);

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
                          exact
                          to={`/dashboard/clients/profile/${id}/vehicles`}
                          activeClassName="active"
                        >
                          Véhicules
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          exact
                          to={`/dashboard/clients/profile/${id}/contracts`}
                          activeClassName="active"
                        >
                          Contrats
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          exact
                          to={`/dashboard/clients/profile/${id}/purchase`}
                          activeClassName="active"
                        >
                          Ventes
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          exact
                          to={`/dashboard/clients/profile/${id}/history`}
                          activeClassName="active"
                        >
                          Historique
                        </NavLink>
                      </li>
                    </ul>
                  </nav>
                  <div className="profileTab-content">
                    <Switch>
                      <Route path="/dashboard/clients/profile/:id/overview" component={Overview} />
                      <Route path="/dashboard/clients/profile/:id/vehicles" component={Vehicles} />
                      <Route path="/dashboard/clients/profile/:id/contracts" component={Contracts} />
                      <Route 
                        path="/dashboard/clients/profile/:id/purchase" 
                        render={() => <PurchaseTab clientData={clientData} />}
                      />
                      <Route path="/dashboard/clients/profile/:id/history" component={HistoryTab} />
                      <Redirect from="/dashboard/clients/profile/:id" to="/dashboard/clients/profile/:id/overview" />
                    </Switch>
                  </div>
                </div>
              </Suspense>
            </SettingWrapper>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default ClientProfile;