/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import PickableListPlaceholder from '~ui/List/PickableList/placeholder'

describe('<PickableListPlaceholder />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<PickableListPlaceholder />)
    expect(wrapper.render()).toMatchSnapshot()
  })
  it('should render correctly with a custom header content', () => {
    const component = shallow(<PickableListPlaceholder headerContent={<p>Bla bla bla d'la pookie</p>} />).render()
    expect(component.find('.pickableList-header').text()).toBe("Bla bla bla d'la pookie")
  })
  it('should render correctly with a custom rows count', () => {
    const component = shallow(<PickableListPlaceholder rowsCount={10} />).render()
    expect(component.find('.pickableList-row').length).toBe(10)
  })
  it('should render correctly with a custom rows count and a custom header', () => {
    const component = shallow(
      <PickableListPlaceholder rowsCount={2} headerContent={<p>Rem Chan, daiskii uwuuu :3 oniichaaaan</p>} />,
    ).render()
    expect(component.find('.pickableList-header').text()).toBe('Rem Chan, daiskii uwuuu :3 oniichaaaan')
    expect(component.find('.pickableList-row').length).toBe(2)
  })
})
