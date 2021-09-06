// @flow
/* eslint-env jest */
import * as React from 'react';
import { render } from 'enzyme';
import FranceConnectTeaserModal from './FranceConnectTeaserModal';
import MockProviders, { addsSupportForPortals, clearSupportForPortals } from '~/testUtils';

beforeEach(() => {
  addsSupportForPortals();
});

afterEach(() => {
  clearSupportForPortals();
});

describe('<FranceConnectTeaserModal />', () => {
  it('renders correctly', () => {
    const wrapper = render(
      <MockProviders store={{}}>
        <FranceConnectTeaserModal />
      </MockProviders>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
