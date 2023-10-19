/* eslint-env jest */
import { getEndDateFromStartAt, isEventLive } from '~/components/Event/EventPageContent/EventHelperFunctions'

describe('EventHelperFunctions', () => {
  it('getEndDateFromStartAt should render correct Date', () => {
    expect(getEndDateFromStartAt('1996-11-28T12:00:00+0200').toLocaleDateString('fr-FR')).toBe('29/11/1996')
  })
  it('isEventLive should render correct boolean', () => {
    expect(
      isEventLive('1996-11-28T12:00:00+0200', '1996-11-29T13:00:00+0200', new Date('1996-11-30T12:30:00+0200')),
    ).toBe(false)
    expect(
      isEventLive('1996-11-28T12:00:00+0200', '1996-11-28T13:00:00+0200', new Date('1996-11-28T12:30:00+0200')),
    ).toBe(true)
    expect(isEventLive('1996-11-28T12:00:00+0200', null, new Date('1996-11-28T16:30:00+0200'))).toBe(true)
    expect(isEventLive('1996-11-30T12:00:00+0200', null, new Date('1996-12-01T11:30:00+0200'))).toBe(false)
    expect(isEventLive('1996-11-29T12:00:00+0200', null, new Date('1996-11-30T11:30:00+0200'))).toBe(false)
    expect(isEventLive(null, null, new Date())).toBe(false)
  })
})
