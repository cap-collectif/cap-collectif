// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { EvaluationsIndexPage } from './EvaluationsIndexPage';

describe('<EvaluationsIndexPage />', () => {
  const props = {};

  it('renders correcty', () => {
    const wrapper = shallow(<EvaluationsIndexPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
