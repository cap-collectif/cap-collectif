// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import styled from 'styled-components';
import Icon, { ICON_NAME as ALL_ICONS } from '~/components/Ui/Icons/Icon';

const Container = styled.ul`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
`;

const IconContainer = styled.li`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 130px;
  width: 130px;
  padding: 10px;
  border: 1px solid #acacac;
  border-radius: 4px;
  margin: 10px;
  text-align: center;

  .name {
    margin-top: 20px;
  }
`;

storiesOf('Core|Icons/Icon', module).add('default', () => <Icon name="link" />);

storiesOf('Core|Icons/Icon', module).add('All', () => {
  return (
    <Container>
      {Object.keys(ALL_ICONS).map(name => (
        <IconContainer>
          <Icon name={ALL_ICONS[name]} width="5rem" height="5rem" />
          <span className="name">{ALL_ICONS[name]}</span>
        </IconContainer>
      ))}
    </Container>
  );
});
