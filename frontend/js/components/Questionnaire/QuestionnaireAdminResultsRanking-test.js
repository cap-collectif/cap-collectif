// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { QuestionnaireAdminResultsRanking } from './QuestionnaireAdminResultsRanking';
import { $refType, $fragmentRefs } from '~/mocks';

describe('<QuestionnaireAdminResultsRanking />', () => {
  const props = {
    $refType,
    choices: {
      totalCount: 4,
      edges: [
        {
          node: { id: 'choix1', $fragmentRefs },
        },
        {
          node: { id: 'choix2', $fragmentRefs },
        },
        {
          node: { id: 'choix3', $fragmentRefs },
        },
        {
          node: { id: 'choix4', $fragmentRefs },
        },
      ],
    },
  };

  it('renders correctly', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsRanking multipleChoiceQuestion={props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
