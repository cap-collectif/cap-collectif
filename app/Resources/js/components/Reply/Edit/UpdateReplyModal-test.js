// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { $refType, $fragmentRefs } from '../../../mocks';
import { UpdateReplyModal } from './UpdateReplyModal';

describe('<UpdateReplyModal />', () => {
  const defaultProps = {
    show: true,
    onClose: () => {},
    reply: {
      $refType,
      $fragmentRefs,
      id: 'UmVwbHk6cmVwbHky',
      createdAt: '2016-03-01 12:26:24',
      publishedAt: '2016-04-25 14:33:17',
      questionnaire: {
        $fragmentRefs,
      },
      draft: false,
    },
    questionnaire: {
      viewerReplies: {},
    },
  };

  const defaultPropsInDraft = {
    show: true,
    onClose: () => {},
    reply: {
      $refType,
      $fragmentRefs,
      id: 'UmVwbHk6cmVwbHky',
      createdAt: '2016-03-01 12:26:24',
      publishedAt: null,
      questionnaire: {
        $fragmentRefs,
      },
      draft: true,
    },
    questionnaire: {
      viewerReplies: {},
    },
  };

  const questionnaireWithReplies = {
    viewerReplies: [
      {
        id: 'UmVwbHk6cmVwbHky',
        $fragmentRefs,
      },
      {
        id: 'UmVwbHk6cmVwbHk1',
        $fragmentRefs,
      },
    ],
  };

  it('should render correctly with minimal props', () => {
    const props = defaultProps;
    const wrapper = shallow(<UpdateReplyModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with replies', () => {
    const props = {
      ...defaultPropsInDraft,
      questionnaire: questionnaireWithReplies,
    };
    const wrapper = shallow(<UpdateReplyModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
