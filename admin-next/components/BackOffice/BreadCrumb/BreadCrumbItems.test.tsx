/* eslint-env jest */
import { render } from '@testing-library/react'
import { CapUIProvider } from '@cap-collectif/ui'
import BreadCrumbItems from './BreadCrumbItems'
import { BreadCrumbItemType } from './BreadCrumbItem'

describe('<BreadCrumbItems />', () => {
  const singleItem = [
    {
      title: 'Project list',
      href: '/projects',
    },
  ]

  const multipleItems: Array<BreadCrumbItemType> = [
    {
      title: 'Project list',
      href: '/projects',
    },
    {
      title: 'New Project',
      href: '',
    },
  ]

  it('should render one single item', () => {
    const { asFragment } = render(
      <CapUIProvider>
        <BreadCrumbItems breadCrumbItems={singleItem} />
      </CapUIProvider>,
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render multiple items with slash in between them', () => {
    const { asFragment } = render(
      <CapUIProvider>
        <BreadCrumbItems breadCrumbItems={multipleItems} />
      </CapUIProvider>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
