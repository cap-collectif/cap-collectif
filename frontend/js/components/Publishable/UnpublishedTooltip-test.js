// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { UnpublishedTooltip } from './UnpublishedTooltip';
import { $refType } from '../../mocks';

describe('<UnpublishedTooltip />', () => {
  it('renders when published', () => {
    const publishablePublished = { $refType, id: 'id1', published: true, notPublishedReason: null };
    const wrapper = shallow(
      <UnpublishedTooltip publishable={publishablePublished} target={jest.fn()} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders when not published because author must confirm', () => {
    const publishableUnublishedWaiting = {
      $refType,
      id: 'id1',
      published: false,
      notPublishedReason: 'WAITING_AUTHOR_CONFIRMATION',
    };
    const wrapper = shallow(
      <UnpublishedTooltip publishable={publishableUnublishedWaiting} target={jest.fn()} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders when not published because author is not confirmed', () => {
    const publishableUnublishedNotConfirmed = {
      $refType,
      id: 'id1',
      published: false,
      notPublishedReason: 'AUTHOR_NOT_CONFIRMED',
    };
    const wrapper = shallow(
      <UnpublishedTooltip publishable={publishableUnublishedNotConfirmed} target={jest.fn()} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders when not published because author confirmed his account too late', () => {
    const publishableUnublishedTooLate = {
      $refType,
      id: 'id1',
      published: false,
      notPublishedReason: 'AUTHOR_CONFIRMED_TOO_LATE',
    };
    const wrapper = shallow(
      <UnpublishedTooltip publishable={publishableUnublishedTooLate} target={jest.fn()} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
