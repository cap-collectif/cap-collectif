// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import { connect } from 'react-redux';
import { NavDropdown, MenuItem } from 'react-bootstrap';
import UserBlockProfile from '../../Ui/BackOffice/UserBlockProfile';
import EarthIcon from '../../Ui/Icons/EarthIcon';
import type { AdminRightNavbar_query } from '~relay/AdminRightNavbar_query.graphql';
import type { FeatureToggles, GlobalState } from '~/types';
import colors from '../../../utils/colors';

export type Props = {|
  query: AdminRightNavbar_query,
  features: FeatureToggles,
  localesData: Array<{| locale: string, path: string |}>,
  currentLocale: string,
|};

const Navbar: StyledComponent<{}, {}, HTMLUListElement> = styled.ul`
  right: 0;
  position: absolute;
  list-style: none;
  #admin-beamer-navbar + ul {
    display: none;
  }
`;

const NavbarItem: StyledComponent<{}, {}, NavDropdown> = styled(NavDropdown)`
  position: relative;
  float: left;
  height: 50px;
  width: 55px;
  border-left: 1px solid ${colors.borderColor};
  padding: 15px 10px;
  a {
    color: #000;
    :hover {
      text-decoration: none;
    }
  }
  svg {
    margin-top: 2px;
    margin-left: 2px;
  }
  #admin-multilangue-dropdown-navbar {
    display: flex;
    span {
      margin-top: 9px;
      margin-left: 5px;
    }
  }
`;

const MenuLocaleItem: StyledComponent<{}, {}, MenuItem> = styled(MenuItem)`
  a {
    color: #000 !important;
    padding-left: 10px !important;
    display: flex !important;
  }
`;

const Placeholder: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  width: 24px;
`;

const AdminRightNavbar = ({ localesData, currentLocale, features, query }: Props) => (
  <Navbar>
    {features.app_news && (
      <NavbarItem
        eventKey={0}
        noCaret
        id="admin-beamer-navbar"
        title={
          <div
            className="dropdown-toggle js-notifications-trigger beamerTrigger ml-5"
            data-toggle="dropdown">
            <i className="fa fa-bell fa-fw" aria-hidden="true" />
          </div>
        }
      />
    )}
    {features.unstable__multilangue && (
      <NavbarItem
        pullRight
        id="admin-multilangue-dropdown-navbar"
        eventKey={1}
        title={<EarthIcon />}>
        {localesData &&
          localesData.map(localeData => (
            <MenuLocaleItem href={localeData.path} key={localeData.locale}>
              {localeData.locale === currentLocale ? (
                <i className="cap-android-done mr-10" />
              ) : (
                <Placeholder />
              )}
              <span>{localeData.locale}</span>
            </MenuLocaleItem>
          ))}
      </NavbarItem>
    )}
    <NavbarItem
      pullRight
      id="admin-profile-dropdown-navbar"
      eventKey={2}
      title={<i className="fa fa-user fa-fw" aria-hidden="true" />}>
      <UserBlockProfile query={query} />
    </NavbarItem>
  </Navbar>
);

const mapStateToProps = (state: GlobalState) => ({
  features: state.default.features,
});

export default createFragmentContainer(connect(mapStateToProps)(AdminRightNavbar), {
  query: graphql`
    fragment AdminRightNavbar_query on Query {
      ...UserBlockProfile_query
    }
  `,
});
