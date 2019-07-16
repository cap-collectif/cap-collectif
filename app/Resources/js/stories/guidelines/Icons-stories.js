// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import styled from 'styled-components';

const glyphes = [
  'cap-ios-close-outline',
  'cap-ios-close',
  'cap-baloon',
  'cap-baloon-1',
  'cap-hand-like-2-1',
  'cap-hand-like-2',
  'cap-hand-unlike-2-1',
  'cap-user-2-1',
  'cap-marker-1',
  'cap-marker-1-1',
  'cap-arrow-1-1',
  'cap-arrow-37',
  'cap-arrow-38',
  'cap-arrow-39',
  'cap-arrow-40',
  'cap-arrow-65',
  'cap-arrow-65-1',
  'cap-arrow-66',
  'cap-arrow-68',
  'cap-coins-2-1',
  'cap-reply-mail-2',
  'cap-pencil-1',
  'cap-android-menu',
  'cap-android-checkmark-circle',
  'cap-delete-1',
  'cap-delete-2',
  'cap-alert-2',
  'cap-calendar-1',
  'cap-calendar-2-1',
  'cap-hourglass-1',
  'cap-paper-plane',
  'cap-magnifier',
  'cap-map-location',
  'cap-filter-1',
  'cap-triangle-down',
  'cap-bin-2',
  'cap-cursor-move',
  'cap-check-bubble',
  'cap-folder-2',
  'cap-times',
  'cap-id-8',
  'cap-external-link',
  'cap-edit-write',
  'cap-setting-adjustment',
  'cap-refresh',
  'cap-power-1',
  'cap-rss',
  'cap-add-1',
  'cap-trophy',
  'cap-tag-1-1',
  'cap-contacts-1',
  'cap-attention',
  'cap-lock-2',
  'cap-lock-2-1',
  'cap-heart-1',
  'cap-th-large',
  'cap-information-1',
  'cap-small-caps-1',
  'cap-bubble-add-2',
  'cap-flag-1',
  'cap-spinner',
  'cap-scissor-1',
  'cap-star-1',
  'cap-star-1-1',
  'cap-folder-2',
  'cap-folder-add',
  'cap-folder-edit',
  'cap-setting-gear',
  'cap-check-4',
  'cap-download-12',
  'cap-pin-1',
  'cap-mail-2-1',
  'cap-link',
  'cap-facebook',
  'cap-twitter',
  'cap-linkedin',
];

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  margin: -10px;
`;

const IconContainer = styled.div`
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

  i {
    font-size: 32px;
  }

  div:last-child {
    text-align: center;
    position: absolute;
    bottom: 10px;
  }
`;

const Icon = ({ glyph }) => <i className={`cap ${glyph}`} />;

storiesOf('Design|Icons', module).add(
  'Icons',
  () => (
    <Container>
      {glyphes.map(glyph => (
        <IconContainer>
          <Icon glyph={glyph} />
          <div className="excerpt small">{glyph}</div>
        </IconContainer>
      ))}
    </Container>
  ),
  {
    info: {
      source: false,
      propTables: null,
    },
    options: {
      showAddonPanel: false,
    },
  },
);
