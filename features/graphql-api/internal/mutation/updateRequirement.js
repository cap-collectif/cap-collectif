import '../../_setup';

const UpdateRequirementMutation = /* GraphQL */ `
  mutation UpdateRequirementMutation(
    $input: UpdateRequirementInput!
  ) {
    updateRequirement(input: $input) {
      requirement {
        id
        viewerMeetsTheRequirement
      }
    }
  }`;

const input = {
  "requirement": "UmVxdWlyZW1lbnQ6cmVxdWlyZW1lbnQz",
  "value": true
}

const inputWithNoRequirement = {
  "requirement": "UmVxdWlyZW1lbnQ6cmVxdWlyZW1lbnQz",
  "value": false
}
describe('mutations.updateRequirementMutation', () => {
  it('wants to accept a requirement as user', async () => {
    await expect(
      graphql(
        UpdateRequirementMutation,
        { input: input },
        'internal_user',
      )
    ).resolves.toMatchSnapshot();
  });
  it('wants to decline a requirement as user', async () => {
    await expect(
      graphql(
        UpdateRequirementMutation,
        { input: inputWithNoRequirement },
        'internal_user',
      )
    ).resolves.toMatchSnapshot();
  });
})