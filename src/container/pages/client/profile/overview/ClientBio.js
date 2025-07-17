import React from 'react';
import FeatherIcon from 'feather-icons-react';
import PropTypes from 'prop-types';
import { UserBioBox } from '../../../../profile/myProfile/overview/style';
import { Cards } from '../../../../../components/cards/frame/cards-frame';

function ClientBio({ clientData }) {
  return (
    <UserBioBox>
      <Cards headless>
        <address className="user-info">
          <h5 className="user-info__title">Informations de contact</h5>
          <ul className="user-info__contact">
          
            <li>
              <FeatherIcon icon="phone" size={14} /> <span>Numéro de téléphone :<b> {clientData.phoneNumber}</b></span>
            </li>
         
            <li>
              <FeatherIcon icon="credit-card" size={14} /> <span>CIN :<b> {clientData.cin}</b></span> 
            </li>

            
           

          </ul>
        </address>
        <div className="user-info">
          <h5 className="user-info__title">Général</h5>
          <ul className="user-info__contact">
          
            <li>
              <FeatherIcon icon="user" size={14} /> <span>Ajouté Par :<b> {clientData.added_by.name}</b></span>
            </li>
         
            <li>
              <FeatherIcon icon="calendar" size={14} /> <span>Ajouté Le :<b> {new Date(clientData.createdAt).toLocaleString()}</b></span>
            </li>

            <li>
              <FeatherIcon icon="calendar" size={14} /> <span>Dernière mise à jour :<b> {new Date(clientData.updatedAt).toLocaleString()}</b></span>
            </li>
            
           

          </ul>
        </div>
    
      </Cards>
    </UserBioBox>
  );
}

ClientBio.propTypes = {
  clientData: PropTypes.object.isRequired,
};

export default ClientBio; 