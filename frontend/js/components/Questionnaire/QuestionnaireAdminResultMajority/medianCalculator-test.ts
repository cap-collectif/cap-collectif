/* eslint-env jest */
import { medianCalculator } from './QuestionnaireAdminResultMajority'
import { $refType } from '~/mocks'

describe('medianCalculator', () => {
  it('get median for even number of replies', () => {
    expect(
      medianCalculator({
        ' $refType': $refType,
        totalVotesCount: 12,
        responsesByChoice: [
          {
            count: 1,
            choice: 'VERY_WELL',
          },
          {
            count: 2,
            choice: 'WELL',
          },
          {
            count: 4,
            choice: 'WELL_ENOUGH',
          },
          {
            count: 1,
            choice: 'PASSABLE',
          },
          {
            count: 1,
            choice: 'NOT_PASSABLE',
          },
          {
            count: 3,
            choice: 'REJECTED',
          },
        ],
      }),
    ).toMatchSnapshot()
  })
  it('get median for uneven number of replies', () => {
    expect(
      medianCalculator({
        ' $refType': $refType,
        totalVotesCount: 11,
        responsesByChoice: [
          {
            count: 1,
            choice: 'VERY_WELL',
          },
          {
            count: 2,
            choice: 'WELL',
          },
          {
            count: 1,
            choice: 'WELL_ENOUGH',
          },
          {
            count: 1,
            choice: 'PASSABLE',
          },
          {
            count: 3,
            choice: 'NOT_PASSABLE',
          },
          {
            count: 3,
            choice: 'REJECTED',
          },
        ],
      }),
    ).toMatchSnapshot()
  })
  it('get median for low number of replies', () => {
    expect(
      medianCalculator({
        ' $refType': $refType,
        responsesByChoice: [
          {
            count: 0,
            choice: 'VERY_WELL',
          },
          {
            count: 1,
            choice: 'WELL',
          },
          {
            count: 0,
            choice: 'WELL_ENOUGH',
          },
          {
            count: 1,
            choice: 'PASSABLE',
          },
          {
            count: 1,
            choice: 'NOT_PASSABLE',
          },
          {
            count: 0,
            choice: 'REJECTED',
          },
        ],
        totalVotesCount: 3,
      }),
    ).toMatchSnapshot()
  })
  it('get median for unique reply', () => {
    expect(
      medianCalculator({
        ' $refType': $refType,
        responsesByChoice: [
          {
            count: 0,
            choice: 'VERY_WELL',
          },
          {
            count: 1,
            choice: 'WELL',
          },
          {
            count: 0,
            choice: 'WELL_ENOUGH',
          },
          {
            count: 0,
            choice: 'PASSABLE',
          },
          {
            count: 0,
            choice: 'NOT_PASSABLE',
          },
          {
            count: 0,
            choice: 'REJECTED',
          },
        ],
        totalVotesCount: 1,
      }),
    ).toMatchSnapshot()
  })
  it('get median for no reply', () => {
    expect(
      medianCalculator({
        ' $refType': $refType,
        totalVotesCount: 7,
        responsesByChoice: [
          {
            count: 1,
            choice: 'VERY_WELL',
          },
          {
            count: 2,
            choice: 'WELL',
          },
          {
            count: 1,
            choice: 'WELL_ENOUGH',
          },
          {
            count: 1,
            choice: 'PASSABLE',
          },
          {
            count: 1,
            choice: 'NOT_PASSABLE',
          },
          {
            count: 1,
            choice: 'REJECTED',
          },
        ],
      }),
    ).toMatchSnapshot()
  })
})
