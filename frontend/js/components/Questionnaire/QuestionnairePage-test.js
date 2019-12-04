// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { QuestionnairePage } from './QuestionnairePage';
import { $fragmentRefs, $refType } from '../../mocks';

describe('<QuestionnairePage />', () => {
  const props = {
    questionnaire: {
      step: {
        $fragmentRefs,
      },
      $refType,
      $fragmentRefs,
    },
  };

  it('renders correctly', () => {
    const wrapper = shallow(<QuestionnairePage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
