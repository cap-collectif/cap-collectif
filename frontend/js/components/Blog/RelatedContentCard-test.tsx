/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { Box, Heading } from '@cap-collectif/ui'
import DefaultProjectImage from '~/components/Project/Preview/DefaultProjectImage'
import { RelatedContentCard } from './RelatedContentCard'

describe('<RelatedContentCard />', () => {
  const props = {
    title: 'Related proposal',
    url: '/project/project/collect/step/proposals/proposal',
  }

  it('renders its label only when provided', () => {
    expect(shallow(<RelatedContentCard {...props} label="Related content" />).find(Heading)).toHaveLength(2)
    expect(shallow(<RelatedContentCard {...props} />).find(Heading)).toHaveLength(1)
  })

  it('renders the related content thumbnail when provided', () => {
    expect(
      shallow(<RelatedContentCard {...props} imageUrl="https://example.com/thumbnail.jpg" />)
        .find(Box)
        .filterWhere(node => node.prop('as') === 'img'),
    ).toHaveLength(1)
  })

  it('uses a default illustration and truncates the title after two lines', () => {
    const component = shallow(<RelatedContentCard {...props} />)

    expect(component.find(DefaultProjectImage)).toHaveLength(1)
    expect(component.find(Heading).last().prop('style')).toMatchObject({ WebkitLineClamp: 2 })
  })
})
