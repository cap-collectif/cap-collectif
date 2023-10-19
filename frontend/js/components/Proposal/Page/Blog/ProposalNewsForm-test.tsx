/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ProposalNewsForm } from './ProposalNewsForm'
import { $refType, formMock } from '~/mocks'

describe('<ProposalNewsForm />', () => {
  const props = {
    ...formMock,
    invalid: false,
    post: null,
    initialValues: {
      title: null,
      abstract: null,
      body: null,
      media: null,
    },
  }
  it('should render correctly', () => {
    const wrapper = shallow(<ProposalNewsForm {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with post', () => {
    const post = {
      ' $refType': $refType,
      id: 'string',
      translations: [
        {
          locale: 'FR_FR',
          title: 'un titre',
          body: '<p>un corps</p>',
          abstract: null,
        },
      ],
      media: {
        url: 'http://localhost/a.jpeg',
        id: 'media1',
      },
    }
    const wrapper = shallow(<ProposalNewsForm {...props} post={post} />)
    expect(wrapper).toMatchSnapshot()
  })
})
