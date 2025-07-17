import React from 'react';
import FeatherIcon from 'feather-icons-react';
import { Row, Col } from 'antd';
import { Cards } from '../../../../../components/cards/frame/cards-frame';
import Heading from '../../../../../components/heading/heading';

function Contracts() {
  return (
    <Row gutter={25}>
      <Col xs={24}>
        <Cards>
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#8c8c8c',
          }}>
            <div style={{ marginBottom: 24 }}>
              <FeatherIcon icon="clock" size={48} style={{ color: '#d9d9d9' }} />
            </div>
            <Heading as="h3" style={{ color: '#8c8c8c', marginBottom: '16px', fontWeight: 600 }}>
              Bientôt disponible
            </Heading>
            <p style={{ fontSize: '16px', margin: 0, color: '#bfbfbf' }}>
              La gestion des contrats sera bientôt disponible sur cette page.
            </p>
          </div>
        </Cards>
      </Col>
    </Row>
  );
}

export default Contracts; 