// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { OpinionEditForm } from './OpinionEditForm';

describe('<OpinionEditForm />', () => {
  const props = {
    handleSubmit: jest.fn(),
    opinion: {
      appendices: [{ type: { title: 'Exposé des motifs' } }],
      title: 'titre',
      body: 'body',
    },
    step: {},
  };

  it('renders a form', () => {
    const wrapper = shallow(<OpinionEditForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
