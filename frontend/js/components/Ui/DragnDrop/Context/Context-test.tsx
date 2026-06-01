/* eslint-env jest */
import React from 'react'
import { mount, shallow } from 'enzyme'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import Context, { DragnDropContext } from './Context'

let mockMonitorArgs: Record<string, any> | null = null

jest.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
  monitorForElements: jest.fn(args => {
    mockMonitorArgs = args
    return jest.fn()
  }),
}))

describe('<Context />', () => {
  beforeEach(() => {
    mockMonitorArgs = null
    ;(monitorForElements as jest.Mock).mockClear()
  })

  it('should render correctly', () => {
    const wrapper = shallow(<Context onDragEnd={() => {}}>Bonjour</Context>)
    expect(wrapper).toMatchSnapshot()
  })

  it('should ignore drag events from another context', () => {
    const onDragEnd = jest.fn()
    const wrapper = mount(<Context onDragEnd={onDragEnd}>Bonjour</Context>)

    mockMonitorArgs?.onDrop({
      source: {
        data: {
          contextId: 'another-context',
          draggableId: 'draggable',
          droppableId: 'source',
          index: 0,
        },
      },
      location: {
        current: {
          dropTargets: [],
        },
      },
    })

    expect(onDragEnd).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('should keep drag events from the current context', () => {
    const onDragEnd = jest.fn()
    let currentContextId
    const wrapper = mount(
      <Context onDragEnd={onDragEnd}>
        <DragnDropContext.Consumer>
          {context => {
            currentContextId = context?.contextId
            return <div />
          }}
        </DragnDropContext.Consumer>
      </Context>,
    )

    mockMonitorArgs?.onDrop({
      source: {
        data: {
          contextId: currentContextId,
          draggableId: 'draggable',
          droppableId: 'source',
          index: 0,
        },
      },
      location: {
        current: {
          dropTargets: [
            {
              data: {
                contextId: currentContextId,
                droppableId: 'destination',
                index: 1,
              },
            },
          ],
        },
      },
    })

    expect(onDragEnd).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: {
          droppableId: 'destination',
          index: 1,
        },
      }),
      expect.any(Object),
    )
    wrapper.unmount()
  })

  it('should ignore drop targets from another context', () => {
    const onDragEnd = jest.fn()
    let currentContextId
    const wrapper = mount(
      <Context onDragEnd={onDragEnd}>
        <DragnDropContext.Consumer>
          {context => {
            currentContextId = context?.contextId
            return <div />
          }}
        </DragnDropContext.Consumer>
      </Context>,
    )

    mockMonitorArgs?.onDrop({
      source: {
        data: {
          contextId: currentContextId,
          draggableId: 'draggable',
          droppableId: 'source',
          index: 0,
        },
      },
      location: {
        current: {
          dropTargets: [
            {
              data: {
                contextId: 'another-context',
                droppableId: 'destination',
                index: 1,
              },
            },
          ],
        },
      },
    })

    expect(onDragEnd).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: null,
      }),
      expect.any(Object),
    )
    expect(onDragEnd.mock.calls[0][0].combine).toBeUndefined()
    wrapper.unmount()
  })

  it('should prefer an item drop target over its parent list drop target', () => {
    const onDragEnd = jest.fn()
    let currentContextId
    const wrapper = mount(
      <Context onDragEnd={onDragEnd}>
        <DragnDropContext.Consumer>
          {context => {
            currentContextId = context?.contextId
            return <div />
          }}
        </DragnDropContext.Consumer>
      </Context>,
    )

    mockMonitorArgs?.onDrop({
      source: {
        data: {
          contextId: currentContextId,
          draggableId: 'first-choice',
          droppableId: 'ranking__selection',
          index: 0,
        },
      },
      location: {
        current: {
          dropTargets: [
            {
              data: {
                contextId: currentContextId,
                droppableId: 'ranking__selection',
              },
            },
            {
              data: {
                contextId: currentContextId,
                draggableId: 'ranking__selection-2',
                droppableId: 'ranking__selection',
                index: 2,
              },
            },
          ],
        },
      },
    })

    expect(onDragEnd).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: null,
        combine: {
          draggableId: 'ranking__selection-2',
          droppableId: 'ranking__selection',
          index: 2,
        },
      }),
      expect.any(Object),
    )
    wrapper.unmount()
  })

  it('should ignore the source item when picking the current context drop target', () => {
    const onDragEnd = jest.fn()
    let currentContextId
    const wrapper = mount(
      <Context onDragEnd={onDragEnd}>
        <DragnDropContext.Consumer>
          {context => {
            currentContextId = context?.contextId
            return <div />
          }}
        </DragnDropContext.Consumer>
      </Context>,
    )

    mockMonitorArgs?.onDrop({
      source: {
        data: {
          contextId: currentContextId,
          draggableId: 'first-choice',
          droppableId: 'ranking__selection',
          index: 0,
        },
      },
      location: {
        current: {
          dropTargets: [
            {
              data: {
                contextId: currentContextId,
                draggableId: 'first-choice',
                droppableId: 'ranking__selection',
                index: 0,
              },
            },
            {
              data: {
                contextId: currentContextId,
                draggableId: 'ranking__selection-3',
                droppableId: 'ranking__selection',
                index: 3,
              },
            },
            {
              data: {
                contextId: currentContextId,
                droppableId: 'ranking__selection',
              },
            },
          ],
        },
      },
    })

    expect(onDragEnd).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: null,
        combine: {
          draggableId: 'ranking__selection-3',
          droppableId: 'ranking__selection',
          index: 3,
        },
      }),
      expect.any(Object),
    )
    wrapper.unmount()
  })

  it('should compute destination index from the list target when no item target is available', () => {
    const onDragEnd = jest.fn()
    let currentContextId
    const listElement = document.createElement('ul')

    ;[0, 1, 2, 3].forEach(index => {
      const child = document.createElement('li')
      child.getBoundingClientRect = jest.fn(() => ({
        top: index * 50,
        bottom: index * 50 + 50,
        height: 50,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: index * 50,
        toJSON: jest.fn(),
      }))
      listElement.appendChild(child)
    })

    const wrapper = mount(
      <Context onDragEnd={onDragEnd}>
        <DragnDropContext.Consumer>
          {context => {
            currentContextId = context?.contextId
            return <div />
          }}
        </DragnDropContext.Consumer>
      </Context>,
    )

    mockMonitorArgs?.onDrop({
      source: {
        data: {
          contextId: currentContextId,
          draggableId: 'first-choice',
          droppableId: 'ranking__selection',
          index: 0,
        },
      },
      location: {
        current: {
          input: {
            clientY: 175,
          },
          dropTargets: [
            {
              element: listElement,
              data: {
                contextId: currentContextId,
                droppableId: 'ranking__selection',
              },
            },
          ],
        },
      },
    })

    expect(onDragEnd).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: {
          droppableId: 'ranking__selection',
          index: 3,
        },
      }),
      expect.any(Object),
    )
    wrapper.unmount()
  })
})
