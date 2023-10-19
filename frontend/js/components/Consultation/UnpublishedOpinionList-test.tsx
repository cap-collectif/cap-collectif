/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { UnpublishedOpinionList } from './UnpublishedOpinionList'
import { $refType, $fragmentRefs } from '../../mocks'

describe('<UnpublishedOpinionList />', () => {
  it('renders nothing when empty', () => {
    const consultation = {
      ' $refType': $refType,
      viewerOpinionsUnpublished: null,
    }
    const wrapper = shallow(<UnpublishedOpinionList consultation={consultation} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correcty', () => {
    const consultation = {
      ' $refType': $refType,
      viewerOpinionsUnpublished: {
        totalCount: 1,
        edges: [
          {
            node: {
              id: 'opinion1',
              ' $fragmentRefs': $fragmentRefs,
              notPublishedReason: 'WAITING_AUTHOR_CONFIRMATION',
            },
          },
        ],
      },
    }
    const wrapper = shallow(<UnpublishedOpinionList consultation={consultation} />)
    expect(wrapper).toMatchSnapshot()
  })
})
