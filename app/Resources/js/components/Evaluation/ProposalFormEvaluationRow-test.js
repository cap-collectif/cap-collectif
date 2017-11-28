// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormEvaluationRow } from './ProposalFormEvaluationRow';

describe('<ProposalFormEvaluationRow />', () => {
  const props = {
    proposal: {
      show_url: 'http://capco.dev/proposal',
      reference: '1-1',
      title: 'Title',
      updatedAt: '2017-07-10T18:53:58+0200',
      status: {
        name: 'En cours',
        id: '1',
      },
    },
  };

  it('renders correcty', () => {
    const wrapper = shallow(<ProposalFormEvaluationRow {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
