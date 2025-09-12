/* eslint-env jest */
import React from 'react'
import { render } from '@testing-library/react'
import { MockProviders } from 'tests/testUtils'
import { NavBarContext } from 'shared/navbar/NavBar.context'
import PageRender from './PageRender'

describe('<PageRender />', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <NavBarContext.Provider value={{ setBreadCrumbItems: jest.fn() }}>
        <MockProviders>
          <PageRender title="My custom page" body="Lorem ipsum" />
        </MockProviders>
      </NavBarContext.Provider>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
