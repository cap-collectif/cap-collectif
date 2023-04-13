// @flow
/* eslint-env jest */
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import LeafletControl from './LeafletControl';
import MockProviders from '~/testUtils';

describe('<LeafletControl />', () => {
  it('should render correctly', () => {
    const testComponentTree = ReactTestRenderer.create(
      <MockProviders>
        <LeafletControl position="bottomright">
          <div>content</div>
        </LeafletControl>
      </MockProviders>,
    );
    expect(testComponentTree).toMatchSnapshot();
  });
});
