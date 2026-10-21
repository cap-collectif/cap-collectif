import { render, screen } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { CapUIProvider } from '@cap-collectif/ui'
import VoteStepProjectHeroStepInfo from './VoteStepProjectHeroStepInfo'

const messages = {
  'step.selection.alert.ended.title': 'Step finished.',
  'step.collect.alert.future.title': 'Future step.',
  'step.start.future': 'This step will start on {date}.',
  'thank.for.contribution': 'Thank you all for participating.',
  'count.daysLeft': '{count, plural, one {day left} other {days left}}',
  'global.dates.full.days': 'From {startD} at {startT} to {endD} at {endT}',
}

const renderStepInfo = (props: React.ComponentProps<typeof VoteStepProjectHeroStepInfo>) =>
  render(
    <CapUIProvider>
      <IntlProvider locale="en" messages={messages}>
        <VoteStepProjectHeroStepInfo {...props} />
      </IntlProvider>
    </CapUIProvider>,
  )

describe('VoteStepProjectHeroStepInfo', () => {
  beforeEach(() => jest.useFakeTimers().setSystemTime(new Date('2026-09-24T10:00:00Z')))
  afterEach(() => jest.useRealTimers())

  it('shows a closed step and its date range', () => {
    renderStepInfo({ state: 'CLOSED', timeRange: { startAt: '2026-09-01T10:00:00Z', endAt: '2026-09-10T10:00:00Z' } })
    expect(screen.getByText('Step finished.')).not.toBeNull()
    expect(screen.getByLabelText('step-information').textContent).toContain('From')
  })

  it('shows the legacy remaining-time label next to an open step date range', () => {
    renderStepInfo({ state: 'OPENED', timeRange: { startAt: '2026-09-20T10:00:00Z', endAt: '2026-09-29T10:00:00Z' } })
    expect(screen.getByText('5 days left')).not.toBeNull()
  })

  it('shows the legacy alert for a future step', () => {
    renderStepInfo({ state: 'FUTURE', timeRange: { startAt: '2026-09-29T10:00:00Z', endAt: null } })
    expect(screen.getByText('Future step.')).not.toBeNull()
  })
})
