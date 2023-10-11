/* eslint-env jest */
import '../../../../_setup';

const UpdateOtherStep = /* GraphQL*/ `
  mutation UpdateOtherStepMutation($input: UpdateOtherStepInput!) {
    updateOtherStep(input: $input) {
      step {
        adminUrl
        title
        label
        body
        metaDescription
        enabled
        customCode
        timeRange {
          startAt
          endAt
        }
      }
    }
  }
`

const input = {
  "title": "updated title",
  "label": "updated label",
  "body": "updated body",
  "isEnabled": false,
  "metaDescription": "updated metadescription",
  "customCode": "updated custom code",
  "startAt": "2023-01-03 16:29:17",
  "endAt": "2023-01-03 16:29:17"
}

describe('mutations.addOtherStepMutation', () => {
  it('admin should be able to edit other step.', async () => {
    const stepId = toGlobalId('OtherStep', 'ostep1'); // T3RoZXJTdGVwOm9zdGVwMQ==
    const response = await graphql(
      UpdateOtherStep,
      {input: {...input, stepId}},
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });
});