// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { OpinionEditForm } from './OpinionEditForm';
import IntlData from '../../../translations/FR';

describe('<OpinionEditForm />', () => {
  const props = {
    fields: [
      {
        name: 'title',
        label: 'title',
      },
      {
        name: 'body',
        label: 'body',
      },
    ],
    form: 'test-form',
    opinion: {
      appendices: [{ type: { title: 'Exposé des motifs' } }],
      title: 'titre',
      body: 'body',
    },
    step: {},
    ...IntlData,
  };

  it('renders a form', () => {
    const wrapper = shallow(<OpinionEditForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
