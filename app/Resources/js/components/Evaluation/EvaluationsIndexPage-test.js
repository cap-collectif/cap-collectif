// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { EvaluationsIndexPage, render } from './EvaluationsIndexPage';

describe('<EvaluationsIndexPage />', () => {
  const props = {};

  it('renders correcty', () => {
    const wrapper = shallow(<EvaluationsIndexPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render function renders correctly', () => {
    const component = render({
      props: { proposalForms: [{ id: '1' }, { id: '2' }] },
      error: null,
      retry: jest.fn(),
    });
    const wrapper = shallow(component);
    expect(wrapper).toMatchSnapshot();
  });
});
