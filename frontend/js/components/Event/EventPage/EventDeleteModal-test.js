// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import EventDeleteModal from './EventDeleteModal';
import MockProviders, { addsSupportForPortals, clearSupportForPortals } from '~/testUtils';

describe('<EventDeleteModal />', () => {
  beforeEach(() => {
    addsSupportForPortals();
  });

  afterEach(() => {
    clearSupportForPortals();
  });

  it('should render correctly', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <EventDeleteModal eventId="id" />
      </MockProviders>,
    );
    expect(testComponentTree).toMatchSnapshot();
  });
});
