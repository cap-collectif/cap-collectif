/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalFormAdminCategories } from './ProposalFormAdminCategories'
import { intlMock, $refType, $fragmentRefs } from '../../mocks'
import { features } from '../../redux/modules/default'

describe('<ProposalFormAdminCategories />', () => {
  const props = {
    dispatch: jest.fn(),
    fields: {
      length: 0,
      map: () => [],
      remove: jest.fn(),
    },
    categories: [],
    query: {
      ' $fragmentRefs': $fragmentRefs,
      ' $refType': $refType,
      proposalCategoryOptions: {
        colors: ['COLOR_004D40', 'COLOR_004D40'],
        icons: ['AGRICULTURE_MACHINE_TRACTOR', 'BASKETBALL_BALL'],
      },
    },
    features,
    intl: intlMock,
  }
  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormAdminCategories {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
