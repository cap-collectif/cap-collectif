import '../../_setupDB'

const UpdateCivicIAMutation = /* GraphQL */ `
  mutation UpdateCivicIAMutation($input: UpdateCivicIAInput!) {
    updateCivicIA(input: $input) {
      analyzables {
        iaCategory
        iaReadability
        iaSentiment
      }
      errorCode
    }
  }
`

const id = toGlobalId('CivicIA', 'responseTagCloud1')

const inputNewsCategory = {
  data: '[{"value_id": "responseTagCloud1","lisibilite": 75.03,"longueur": 14,"sentiment": "NEUTRAL","sentiment_score": {"Positive": 0.0189564861,"Negative": 0.0064354725,"Neutral": 0.9745733738,"Mixed": 0.0000347175},"categories": "/news","categories_details": [{"score":0.834992,"label":"/news"},{"score":0.663648,"label":"/automotive and vehicles/vehicle rental"},{"score":0.660499,"label":"/news/national news"}]},{"value_id": "responseTagCloud3","lisibilite": 42,"longueur": 12,"sentiment": "POSITIVE","sentiment_score": {"Positive": 0.9745733738,"Negative": 0.0064354725,"Neutral": 0.0064354725,"Mixed": 0.0000347175},"categories": "/business and industrial/business operations/management/business process","categories_details": [{"score":0.678294,"label":"/business and industrial/business operations/management/business process"},{"score":0.626611,"label":"/automotive and vehicles/vehicle rental"}]}]',
  clientMutationId: id,
}

describe('mutations.updateCivicIAMutation', () => {
  it('should update civicIA in news category', async () => {
    await expect(
      graphql(UpdateCivicIAMutation, { input: inputNewsCategory }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })
})
