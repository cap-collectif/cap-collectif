/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { MediaAdminList } from './MediaAdminList'
import { $refType, relayPaginationMock } from '~/mocks'

const emptyProps = {
  relay: { ...relayPaginationMock },
  query: {
    ' $refType': $refType,
    medias: {
      totalCount: 0,
      pageInfo: {
        hasNextPage: false,
      },
      edges: [],
    },
  },
}
const withMediaProps = {
  relay: { ...relayPaginationMock },
  query: {
    ' $refType': $refType,
    medias: {
      totalCount: 42,
      pageInfo: {
        hasNextPage: true,
      },
      edges: [
        {
          cursor: 'e3z(5',
          node: {
            id: '5452467',
            name: 'oui',
            height: 100,
            width: 50,
            url: '/url/ok',
            providerReference: 'oui.svg',
            size: '12342',
          },
        },
        {
          cursor: '6ty7r',
          node: {
            id: '46575',
            name: 'ayaaaaa',
            height: 200,
            width: 60,
            url: '/url/nonoon',
            providerReference: 'okokokook.svg',
            size: '43434',
          },
        },
      ],
    },
  },
}
describe('<MediaAdminList />', () => {
  it('renders correctly with no media', () => {
    const wrapper = shallow(<MediaAdminList {...emptyProps} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly with medias', () => {
    const wrapper = shallow(<MediaAdminList {...withMediaProps} />)
    expect(wrapper).toMatchSnapshot()
  })
})
