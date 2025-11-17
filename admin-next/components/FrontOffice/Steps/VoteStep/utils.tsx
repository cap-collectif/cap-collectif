export const getOrderByArgs = (sort: string | null) => {
  if (!sort) return null
  const sortBy = {
    random: {
      field: 'RANDOM',
      direction: 'ASC',
    },
    last: {
      field: 'PUBLISHED_AT',
      direction: 'DESC',
    },
    old: {
      field: 'PUBLISHED_AT',
      direction: 'ASC',
    },
    comments: {
      field: 'COMMENTS',
      direction: 'ASC',
    },
    expensive: {
      field: 'COST',
      direction: 'DESC',
    },
    cheap: {
      field: 'COST',
      direction: 'ASC',
    },
    votes: {
      field: 'VOTES',
      direction: 'DESC',
    },
    'least-votes': {
      field: 'VOTES',
      direction: 'ASC',
    },
    points: {
      field: 'POINTS',
      direction: 'DESC',
    },
    'least-points': {
      field: 'POINTS',
      direction: 'ASC',
    },
  }
  return [
    {
      field: sortBy[sort].field,
      direction: sortBy[sort].direction,
    },
  ]
}
