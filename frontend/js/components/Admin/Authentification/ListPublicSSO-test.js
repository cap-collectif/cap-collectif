// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ListPublicSSO } from './ListPublicSSO';
import { features } from '../../../redux/modules/default';
import { $refType } from '../../../mocks';

describe('<ListPublicSSO />', () => {
  const props = {
    features,
    onToggle: jest.fn(),
    query: {
      ...$refType,
      ssoConfigurations: {
        edges: []
      }
    },
  };

  it('renders correctly without France Connect', () => {
    const wrapper = shallow(
      <ListPublicSSO {...props} query={props.query} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders all element with France Connect', () => {
    const wrapper = shallow(
      <ListPublicSSO
        features={{ ...features, login_franceconnect: true }}
        onToggle={jest.fn()}
        query={props.query}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
