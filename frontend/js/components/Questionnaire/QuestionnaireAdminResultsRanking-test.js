// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { QuestionnaireAdminResultsRanking } from './QuestionnaireAdminResultsRanking';
import { $refType } from '../../mocks';

describe('<QuestionnaireAdminResultsRanking />', () => {
  const props = {
    $refType,
    choices: {
      edges: [
        {
          node: { title: 'choix1', ranking: [] },
        },
        {
          node: { title: 'choix2', ranking: [] },
        },
        {
          node: { title: 'choix3', ranking: [] },
        },
        {
          node: { title: 'choix4', ranking: [] },
        },
      ],
    },
  };

  it('renders correctly', () => {
    const wrapper = shallow(<QuestionnaireAdminResultsRanking multipleChoiceQuestion={props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
