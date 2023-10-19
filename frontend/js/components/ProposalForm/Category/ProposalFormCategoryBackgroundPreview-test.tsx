/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ProposalFormCategoryBackgroundPreview } from './ProposalFormCategoryBackgroundPreview'

describe('<ProposalFormCategoryBackgroundPreview />', () => {
  const props = {
    color: 'blue',
    icon: 'parking',
    name: 'parking bleu',
    customCategoryImage: null,
  }
  it('render correctly', () => {
    const wrapper = shallow(<ProposalFormCategoryBackgroundPreview {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('render correctly with custom image', () => {
    const wrapper = shallow(
      <ProposalFormCategoryBackgroundPreview
        {...props}
        customCategoryImage={{
          id: 'customCategoryImage',
          image: {
            id: 'uploadedId',
            name: 'customimage',
            url: 'http://isitckPhoto.customimage.jpg',
          },
        }}
      />,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
