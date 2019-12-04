// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalFormEvaluationRow } from './ProposalFormEvaluationRow';
import { $fragmentRefs, $refType } from '../../mocks';

describe('<ProposalFormEvaluationRow />', () => {
  const props = {
    proposal: {
      $fragmentRefs,
      $refType,
      url: 'http://capco.dev/proposal',
      reference: '1-1',
      title: 'Title',
    },
  };

  it('renders correcty', () => {
    const wrapper = shallow(<ProposalFormEvaluationRow {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
