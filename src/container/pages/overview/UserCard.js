import React, { useState } from 'react';
import FeatherIcon from 'feather-icons-react';
import { Link, useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { message, Popconfirm } from 'antd';
import { UserCard } from '../style';
import Heading from '../../../components/heading/heading';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Button } from '../../../components/buttons/buttons';
import clientService from '../../../config/api/client.service';
import AddClientForm from '../client/AddClientForm';

function UserCards({ user, onUpdate }) {
  const history = useHistory();
  const [state, setState] = useState({
    visible: false,
    isSubmitting: false,
    isDeleting: false,
  });

  const { name, designation, img, _id, cin, phoneNumber } = user;

  const showModal = () => {
    setState(prev => ({
      ...prev,
      visible: true,
    }));
  };

  const handleCancel = () => {
    setState(prev => ({
      ...prev,
      visible: false,
    }));
  };

  const handleEditOk = async (values) => {
    setState(prev => ({ ...prev, isSubmitting: true }));
    try {
      await clientService.updateClient(_id, values);
      message.success('Client mis à jour avec succès');
      setState(prev => ({
        ...prev,
        visible: false,
        isSubmitting: false,
      }));
      // Call the onUpdate callback if provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      message.error(error?.message || 'Erreur lors de la mise à jour du client');
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleDelete = async () => {
    try {
      setState(prev => ({ ...prev, isDeleting: true }));
      await clientService.deleteClient(_id);
      message.success('Client supprimé avec succès');
      // Redirect to clients list page
      history.push('/dashboard/clients/list');
    } catch (error) {
      message.error(error?.message || 'Erreur lors de la suppression du client');
      setState(prev => ({ ...prev, isDeleting: false }));
    }
  };

  return (
    <UserCard>
      <div className="card user-card">
        <Cards headless>
          <figure>
            {img && <img src={require(`../../../${img}`)} alt="" />}
          </figure>
          <figcaption>
            <div className="card__content">
              <Heading className="card__name" as="h6">
                <Link to="#">{name}</Link>
              </Heading>
              <p className="card__designation">{designation}</p>
            </div>

            <div className="card__actions">
              <Button size="default" type="white" onClick={showModal}>
                <FeatherIcon icon="edit" size={14} />
                Modifier
              </Button>
              <Popconfirm
                title="Êtes-vous sûr de vouloir supprimer ce client ?"
                onConfirm={handleDelete}
                okText="Oui"
                cancelText="Non"
                okButtonProps={{ danger: true }}
              >
                <Button size="default" type="white" loading={state.isDeleting}>
                  <FeatherIcon icon="trash-2" size={14} />
                  Supprimer
                </Button>
              </Popconfirm>
            </div>
           
          </figcaption>
        </Cards>
      </div>

      <AddClientForm
        visible={state.visible}
        onCancel={handleCancel}
        onSubmit={handleEditOk}
        loading={state.isSubmitting}
        initialValues={{
          fname: name.split(' ')[0],
          lname: name.split(' ').slice(1).join(' '),
          cin,
          phoneNumber,
        }}
        modalTitle="Modifier les informations du client"
        okText="Enregistrer"
      />
    </UserCard>
  );
}

UserCards.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    designation: PropTypes.string,
    img: PropTypes.string,
    _id: PropTypes.string.isRequired,
    cin: PropTypes.string,
    phoneNumber: PropTypes.string,
  }).isRequired,
  onUpdate: PropTypes.func,
};

export default UserCards;
