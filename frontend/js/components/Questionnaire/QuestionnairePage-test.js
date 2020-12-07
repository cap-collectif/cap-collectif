// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { QuestionnairePage } from './QuestionnairePage';
import { $fragmentRefs, $refType } from '~/mocks';

const props = {
  questionnaire: {
    multipleRepliesAllowed: false,
    step: {
      $fragmentRefs,
    },
    viewerReplies: {
      totalCount: 2,
    },
    $refType,
    $fragmentRefs,
  },
};

const propsWithMultipleRepliesAllowed = {
  ...props,
  questionnaire: {
    ...props.questionnaire,
    multipleRepliesAllowed: true,
  },
};

const propsWithoutViewerReplies = {
  ...props,
  questionnaire: {
    ...props.questionnaire,
    viewerReplies: {
      totalCount: 0,
    },
  },
};

describe('<QuestionnairePage />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<QuestionnairePage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with multipleRepliesAllowed', () => {
    const wrapper = shallow(<QuestionnairePage {...propsWithMultipleRepliesAllowed} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without viewerReplies', () => {
    const wrapper = shallow(<QuestionnairePage {...propsWithoutViewerReplies} />);
    expect(wrapper).toMatchSnapshot();
  });
});
