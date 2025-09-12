/* eslint-env jest */
import React from 'react'
import { render } from '@testing-library/react'
import { NavBarContext } from 'shared/navbar/NavBar.context'
import { MockProviders } from 'tests/testUtils'
import Contact from './Contact'

describe('<Contact />', () => {
  const data = {
    contactPageTitle: { value: 'Contact us' },
    description: { value: 'Lorem ipsum' },
    customCode: { value: '<style>div{display:flex;}</style>' },
    contactForms: [
      { id: 'contactForm1', body: 'blablabla nice project nice collab', title: 'For a project' },
      { id: 'contactForm2', body: 'blblbl nice platform', title: 'For another request', confidentiality: 'CNIL stuff' },
    ],
  }

  it('renders correctly', () => {
    const { asFragment } = render(
      <NavBarContext.Provider value={{ setBreadCrumbItems: jest.fn() }}>
        <MockProviders>
          <Contact data={data} />
        </MockProviders>
      </NavBarContext.Provider>,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
