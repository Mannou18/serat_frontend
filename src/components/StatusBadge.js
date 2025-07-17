import React from 'react';
import { Tag } from 'antd';
import PropTypes from 'prop-types';

const StatusBadge = ({ isActive }) => (
  <Tag color={isActive ? 'green' : 'red'} style={{ fontWeight: 600 }}>
    {isActive ? 'Actif' : 'Inactif'}
  </Tag>
);

StatusBadge.propTypes = {
  isActive: PropTypes.bool.isRequired,
};

export default StatusBadge; 