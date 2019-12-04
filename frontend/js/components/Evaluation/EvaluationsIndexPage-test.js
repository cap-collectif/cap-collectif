// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { EvaluationsIndexPage, renderComponent } from './EvaluationsIndexPage';
import { $fragmentRefs } from '../../mocks';

describe('<EvaluationsIndexPage />', () => {
  const props = {};

  it('renders correcty', () => {
    const wrapper = shallow(<EvaluationsIndexPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render function renders correctly', () => {
    const component = renderComponent({
      props: { proposalForms: [{ id: '1', $fragmentRefs }, { id: '2', $fragmentRefs }] },
      error: null,
      retry: jest.fn(),
    });
    const wrapper = shallow(component);
    expect(wrapper).toMatchSnapshot();
  });
});
