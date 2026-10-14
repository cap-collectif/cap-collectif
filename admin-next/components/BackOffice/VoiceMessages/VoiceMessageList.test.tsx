/* eslint-env jest */
import { fireEvent, render, screen, within } from '@testing-library/react'
import { VoiceMessageListTestQuery } from '@relay/VoiceMessageListTestQuery.graphql'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { addsSupportForPortals, clearSupportForPortals, RelaySuspensFragmentTest } from 'tests/testUtils'
import VoiceMessageList from './VoiceMessageList'

const query = graphql`
  query VoiceMessageListTestQuery($first: Int) @relay_test_operation {
    ...VoiceMessageList_query @arguments(first: $first)
  }
`

const mockResolvers = {
  Query: () => ({
    vocals: {
      edges: [
        {
          node: {
            id: 'vocal-user',
            completionStatus: 'COMPLETED',
            createdAt: '2026-10-13 10:00:00',
            user: { username: 'Alice', email: 'alice@cap-collectif.com' },
            participant: null,
          },
        },
        {
          node: {
            id: 'vocal-participant',
            completionStatus: 'MISSING_REQUIREMENTS',
            createdAt: '2026-10-13 11:00:00',
            user: null,
            participant: { firstname: null, lastname: null, username: null, email: null },
          },
        },
      ],
      pageInfo: { hasNextPage: false, endCursor: null },
    },
  }),
}

describe('<VoiceMessageList />', () => {
  let playSpy: jest.SpyInstance

  const renderList = () => {
    const environment = createMockEnvironment()
    environment.mock.queueOperationResolver(operation => MockPayloadGenerator.generate(operation, mockResolvers))
    const TestRenderer = () => {
      const data = useLazyLoadQuery<VoiceMessageListTestQuery>(query, { first: 50 })
      return data ? <VoiceMessageList queryReference={data} /> : null
    }

    return render(
      <RelaySuspensFragmentTest environment={environment}>
        <TestRenderer />
      </RelaySuspensFragmentTest>,
    )
  }

  beforeEach(() => {
    addsSupportForPortals()
    playSpy = jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    jest.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    jest.spyOn(window.HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
  })

  afterEach(() => {
    clearSupportForPortals()
    jest.restoreAllMocks()
  })

  it('displays the status, the author and the protected download link of each vocal', async () => {
    renderList()

    await screen.findByText('Alice')
    const [userRow, participantRow] = screen.getAllByRole('row').slice(1)

    expect(within(userRow).getByText('admin.voice-messages.status.completed')).toBeTruthy()
    expect(within(userRow).getByText('Alice')).toBeTruthy()
    expect(within(userRow).getByText('alice@cap-collectif.com')).toBeTruthy()
    // An anonymous contribution without participant information
    expect(within(participantRow).getByText('admin.voice-messages.status.missing-requirements')).toBeTruthy()
    expect(within(participantRow).getByText('global.anonymous')).toBeTruthy()
    expect(within(participantRow).getByText('admin.voice-messages.author.participant')).toBeTruthy()

    const downloads = screen.getAllByRole('link', { name: 'admin.voice-messages.download' })
    expect(downloads.map(link => link.getAttribute('href'))).toEqual([
      '/admin/voice-messages/vocal-user/file?download=1',
      '/admin/voice-messages/vocal-participant/file?download=1',
    ])
  })

  it('plays one vocal at a time and stops it on a second click', async () => {
    renderList()
    await screen.findByText('Alice')

    const [firstPlay, secondPlay] = screen.getAllByRole('button', { name: 'admin.voice-messages.play' })
    fireEvent.click(firstPlay)
    expect(playSpy).toHaveBeenCalledTimes(1)
    expect((playSpy.mock.instances[0] as HTMLAudioElement).src).toContain('/admin/voice-messages/vocal-user/file')
    expect(screen.getAllByRole('button', { name: 'admin.voice-messages.stop' })).toHaveLength(1)

    fireEvent.click(secondPlay)
    expect(playSpy).toHaveBeenCalledTimes(2)
    expect((playSpy.mock.instances[1] as HTMLAudioElement).src).toContain(
      '/admin/voice-messages/vocal-participant/file',
    )
    expect(screen.getAllByRole('button', { name: 'admin.voice-messages.stop' })).toHaveLength(1)

    fireEvent.click(screen.getByRole('button', { name: 'admin.voice-messages.stop' }))
    expect(screen.queryByRole('button', { name: 'admin.voice-messages.stop' })).toBeNull()
    expect(screen.getAllByRole('button', { name: 'admin.voice-messages.play' })).toHaveLength(2)
  })
})
