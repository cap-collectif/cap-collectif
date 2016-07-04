/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { OpinionForm } from './OpinionForm';
import IntlData from '../../../translations/FR';

describe('<OpinionForm />', () => {
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
    handleSubmit: () => {},
    ...IntlData,
  };

  it('renders a form', () => {
    const wrapper = shallow(<OpinionForm {...props} />);
    expect(wrapper.find('Form').length).to.equal(1);
  });
});
