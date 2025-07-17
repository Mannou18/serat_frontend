import React from 'react';
import { Menu } from 'antd';
import { NavLink, useRouteMatch } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import propTypes from 'prop-types';

const { SubMenu } = Menu;

function MenuItems({ darkMode, toggleCollapsed, topMenu }) {
  const { path } = useRouteMatch();
  const pathName = window.location.pathname;
  const pathArray = pathName.split(path);
  const mainPath = pathArray[1];
  const mainPathSplit = mainPath.split('/');
  const [openKeys, setOpenKeys] = React.useState(
    !topMenu ? [`${mainPathSplit.length > 2 ? mainPathSplit[1] : 'dashboard'}`] : [],
  );

  const onOpenChange = (keys) => {
    setOpenKeys(keys[keys.length - 1] !== 'recharts' ? [keys.length && keys[keys.length - 1]] : keys);
  };

  const onClick = (item) => {
    if (item.keyPath.length === 1) setOpenKeys([]);
  };

  return (
    <Menu
      onOpenChange={onOpenChange}
      onClick={onClick}
      mode={!topMenu || window.innerWidth <= 991 ? 'inline' : 'horizontal'}
      theme={darkMode && 'dark'}
      defaultSelectedKeys={
        !topMenu
          ? [
              `${
                mainPathSplit.length === 1 ? 'home' : mainPathSplit.length === 2 ? mainPathSplit[1] : mainPathSplit[2]
              }`,
            ]
          : []
      }
      defaultOpenKeys={!topMenu ? [`${mainPathSplit.length > 2 ? mainPathSplit[1] : 'dashboard'}`] : []}
      overflowedIndicator={<FeatherIcon icon="more-vertical" />}
      openKeys={openKeys}
    >
      {/* Page d'accueil (renamed dashboard) */}
      <Menu.Item key="home" icon={<FeatherIcon icon="home" />}>
        <NavLink onClick={toggleCollapsed} to={`${path}`}>
          Page d&apos;accueil
        </NavLink>
      </Menu.Item>

      {/* Articles */}
      <SubMenu key="products" icon={<FeatherIcon icon="shopping-cart" />} title="Articles">
        <Menu.Item key="product-list">
          <NavLink onClick={toggleCollapsed} to={`${path}/product-list`}>
            Liste des articles
          </NavLink>
        </Menu.Item>
        <Menu.Item key="categories">
          <NavLink onClick={toggleCollapsed} to={`${path}/categories`}>
            Catégories
          </NavLink>
        </Menu.Item>
      </SubMenu>

      {/* Clients */}
      <SubMenu key="clients" icon={<FeatherIcon icon="users" size={18} />} title="Clients">
        <Menu.Item key="clients-list">
          <NavLink onClick={toggleCollapsed} to={`${path}/clients/list`}>
            Listes des clients
          </NavLink>
        </Menu.Item>
        <Menu.Item key="clients-car-brands">
          <NavLink onClick={toggleCollapsed} to={`${path}/clients/car-brands`}>
            Marques de voitures
          </NavLink>
        </Menu.Item>
      </SubMenu>


      {/* Neotrack */}
      <Menu.Item key="neotrack" icon={<FeatherIcon icon="navigation" size={18} />}>
        <NavLink onClick={toggleCollapsed} to={`${path}/neotrack`}>
          Neotrack
        </NavLink>
      </Menu.Item>
    </Menu>
  );
}

MenuItems.propTypes = {
  darkMode: propTypes.bool,
  topMenu: propTypes.bool,
  toggleCollapsed: propTypes.func,
};

export default MenuItems;
