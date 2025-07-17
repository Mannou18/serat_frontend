import React, { useCallback } from 'react';
import { Form, Input, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { AuthWrapper } from './style';
import { login } from '../../../../redux/authentication/actionCreator';

function SignIn() {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.auth.loading);
  const error = useSelector((state) => state.auth.error);
  const [form] = Form.useForm();

  const handleSubmit = useCallback((values) => {
    dispatch(login(values.phone, values.password));
  }, [dispatch]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <AuthWrapper>
        <Form name="login" form={form} onFinish={handleSubmit} layout="vertical" style={{ width: 350 }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img 
              src="./logo_serat.jpg" 
              alt="SERAT Logo" 
              style={{ 
                maxWidth: '350px',
                height: 'auto',
                marginBottom: '1rem'
              }} 
            />
            {error && (
              <div style={{ 
                color: '#b72025', 
                marginBottom: '2rem',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Identifiants incorrects
              </div>
            )}
          </div>
          <Form.Item
            name="phone"
            label="Numéro de téléphone"
            rules={[
              { required: true, message: 'Veuillez entrer votre numéro de téléphone !' },
              {
                pattern: /^[0-9]{8}$/,
                message: 'Le numéro de téléphone doit contenir exactement 8 chiffres !'
              }
            ]}
          >
            <Input 
              placeholder="Entrez votre numéro de téléphone" 
              maxLength={8}
              type="tel"
              onKeyPress={(e) => {
                const isNumber = /[0-9]/.test(e.key);
                if (!isNumber) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>
          <Form.Item 
            name="password" 
            label="Mot de passe" 
            rules={[
              { required: true, message: 'Veuillez entrer votre mot de passe!' },
              { min: 8, message: 'Le mot de passe doit contenir au moins 8 caractères!' }
            ]}
          > 
            <Input.Password placeholder="Mot de passe" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'center' }}>
            <Button 
              className="btn-signin" 
              htmlType="submit" 
              type="primary" 
              size="large" 
              style={{ 
                width: '100%',
                backgroundColor: '#b72025',
                borderColor: '#b72025',
                '&:hover': {
                  backgroundColor: '#a11d21',
                  borderColor: '#a11d21',
                }
              }}
            >
              {isLoading ? 'Chargement...' : 'Se Connecter'}
            </Button>
          </Form.Item>
        </Form>
      </AuthWrapper>
    </div>
  );
}

export default SignIn;
