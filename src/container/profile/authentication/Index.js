import React from 'react';
import { Row, Col } from 'antd';

const AuthLayout = (WraperContent) => {
  return function () {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#fff' }}>
        <Row justify="center" style={{ width: '100%' }}>
          <Col xxl={8} xl={8} lg={10} md={12} sm={18} xs={24} style={{ padding: '0 16px' }}>
            <WraperContent />
          </Col>
        </Row>
      </div>
    );
  };
};

export default AuthLayout;
