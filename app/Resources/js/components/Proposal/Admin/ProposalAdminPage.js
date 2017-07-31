// @flow
import React, { Component } from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import ProposalAdminSelections from './ProposalAdminSelections';
import type { Uuid } from '../../../types';

type DefaultProps = void;
type Props = {
  projectId: Uuid,
  proposalId: number,
};
type State = void;

export default class ProposalAdminPage extends Component<
  DefaultProps,
  Props,
  State,
> {
  render() {
    return (
      <Nav bsStyle="tabs" justified activeKey={2}>
        <NavItem eventKey={1} title="Activité" disabled />
        <NavItem eventKey={2} title="Contenu" />
        <NavItem eventKey={3} title="Suivi" />
        <NavItem eventKey={4} title="Evalutation" />
        <NavItem eventKey={5} title="Avancement">
          <ProposalAdminSelections {...this.props} />
        </NavItem>
        <NavItem eventKey={6} title="Publication" />
      </Nav>
    );
  }
}
