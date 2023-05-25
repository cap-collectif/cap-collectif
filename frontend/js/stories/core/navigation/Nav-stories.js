// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs';
import { NavContainer, NavItem, Count } from '~/components/Admin/Project/ProjectAdminContent.style';

storiesOf('Core/Navigation/Nav', module)
  .add('NavItem', () => (
    <NavContainer>
      <NavItem active={boolean('active', true)}>
        <a href>Contributions</a>
      </NavItem>
    </NavContainer>
  ))
  .add('NavList', () => (
    <NavContainer>
      <NavItem>
        <a href>Contributions</a> <Count>42</Count>
      </NavItem>
      <NavItem active>
        <a href>Contributeurs</a>
        <Count active>35</Count>
      </NavItem>
      <NavItem>
        <a href>Analyse</a>
      </NavItem>
    </NavContainer>
  ));
