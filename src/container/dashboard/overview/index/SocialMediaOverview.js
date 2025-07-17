import React from 'react';
import { Row, Col, Card } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTags, faCar, faSatelliteDish, faTools, faMoneyBillWave, faArchive } from '@fortawesome/free-solid-svg-icons';
import CountUp from 'react-countup';
import { SocialMediaWrapper } from '../../style';
import axios from '../../../../config/api/axios.config';

function SocialMediaOverview() {
  const [globalStats, setGlobalStats] = React.useState({});

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/stats/global');
        setGlobalStats(response.data || {});
      } catch (e) {
        setGlobalStats({});
      }
    };
    fetchStats();
  }, []);

  // Helper to extract number from $numberDecimal or fallback
  const getNumber = (val) => {
    if (val && typeof val === 'object' && val.$numberDecimal) return Number(val.$numberDecimal);
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && !Number.isNaN(Number(val))) return Number(val);
    return undefined;
  };

  const stats = [
    {
      icon: faSatelliteDish,
      color: '#6d4c41',
      label: 'Neotracks',
      value: getNumber(globalStats.totalNeotracks),
      bg: 'rgba(109,76,65,0.08)',
    },
    {
      icon: faCar,
      color: '#1976d2',
      label: 'Voitures',
      value: getNumber(globalStats.totalVoitures),
      bg: 'rgba(25,118,210,0.08)',
    },
    {
      icon: faTags,
      color: '#b71c1c',
      label: 'Catégories',
      value: getNumber(globalStats.categories),
      bg: 'rgba(183,28,28,0.08)',
    },
    {
      icon: faTools,
      color: '#388e3c',
      label: 'Services',
      value: getNumber(globalStats.totalServices),
      bg: 'rgba(56,142,60,0.08)',
    },
    {
      icon: faMoneyBillWave,
      color: '#f57c00',
      label: 'Achats',
      value: getNumber(globalStats.totalAchatsComptants),
      bg: 'rgba(245,124,0,0.08)',
      isMoney: true,
    },
    {
      icon: faArchive,
      color: '#8e24aa',
      label: 'Produits',
      value: getNumber(globalStats.products),
      bg: 'rgba(142,36,170,0.08)',
    },
  ];

  return (
    <SocialMediaWrapper>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32 }}>Page d&apos;accueil</h1>
      <Row gutter={[32, 32]} justify="start" wrap={false}>
        {stats.map((stat) => (
          <Col xxl={4} xl={4} lg={4} md={8} sm={12} xs={24} key={stat.label}>
            <Card
              style={{
                borderRadius: 16,
                boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                textAlign: 'center',
                padding: '32px 0',
                background: stat.bg,
                minHeight: 180,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              bordered={false}
            >
              <div style={{
                background: stat.color,
                borderRadius: '50%',
                width: 64,
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}>
                <FontAwesomeIcon icon={stat.icon} color="#fff" size="2x" />
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, color: stat.color, marginBottom: 6 }}>
                {typeof stat.value === 'number' ? (
                  <CountUp end={stat.value} duration={1.2} separator=" " />
                ) : (
                  '--'
                )}
                {stat.isMoney && typeof stat.value === 'number' ? <span style={{ fontSize: 18, marginLeft: 4 }}>DT</span> : null}
              </div>
              <div style={{ fontSize: 18, color: '#222', fontWeight: 500 }}>{stat.label}</div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Statistique totale</div>
            </Card>
          </Col>
        ))}
        </Row>
    </SocialMediaWrapper>
  );
}

export default SocialMediaOverview;
