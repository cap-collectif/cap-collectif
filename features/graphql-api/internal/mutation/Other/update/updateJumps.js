/* eslint-env jest */
import '../../../../_setup'

const UpdateJumpsMutation = /* GraphQL*/ `
    mutation UpdateJumpsMutation($input: UpdateJumpsInput!) {
      updateJumps(input: $input) {
        questions {
          title
          alwaysJumpDestinationQuestion {
            title
          }
          jumps {
            origin {
              title
            }
            destination {
              title
            }
            conditions {
              operator
              question {
                title
              }
              value {
                title
              }
            }
          }
        }
      }
    }
`

const defaultInput = {
  "questionnaireId": "questionnaireJumps",
  "questionsJumps": [
    {
      "alwaysJumpDestinationQuestion": "UXVlc3Rpb246Mzk0Nw==", // Question:3947
      "questionId": "UXVlc3Rpb246Mzk0Ng==",
      "jumps": [
        {
          "id": "logicjumpQ1",
          "conditions": [
            {
              "id": "ljcLogicjumpQ1-1",
              "operator": "IS_NOT",
              "question": "UXVlc3Rpb246Mzk0Ng==", // Question:3946
              "value": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25DaG9pY2VKdW1wUXVlc3Rpb25SMQ==" // QuestionChoice:questionChoiceJumpQuestionR1
            },
            {
              "id": "ljcLogicjumpQ1-2",
              "operator": "IS",
              "question": "UXVlc3Rpb246Mzk0Ng==", // Question:3946
              "value": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25DaG9pY2VKdW1wUXVlc3Rpb25SMw==" // QuestionChoice:questionChoiceJumpQuestionR3
            },
          ],
          "destination": "UXVlc3Rpb246MTQwNQ==" // Question:1405
        }
      ]
    }
  ],
}

describe('mutations.updateJumps', () => {

  it('should add a new logic jump with temporaryId.', async () => {
    const newJump = {
      "conditions": [
        {
          "question": "e3e19281-48bb-48ec-a5c6-1eb2d1804276",
          "value": "97d1d830-40fa-4e30-96c9-1a225250c0d3",
          "operator": "IS"
        }
      ],
      "destination": "a2bce3ce-0524-4884-a03a-4a9acea60dfe"
    }

    const input = JSON.parse(JSON.stringify(defaultInput));
    input.questionsJumps[0].jumps.push(newJump);

    const response = await graphql(
      UpdateJumpsMutation,
      {input},
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });

  it('should update existing logic jump and add a new condition.', async () => {
    const newCondition = {
      "question": "UXVlc3Rpb246Mzk0Ng==",
      "value": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25DaG9pY2VKdW1wUXVlc3Rpb25SMg==",
      "operator": "IS_NOT"
    }

    const input = JSON.parse(JSON.stringify(defaultInput));
    input.questionsJumps[0].jumps[0].conditions.push(newCondition);

    const response = await graphql(
      UpdateJumpsMutation,
      { input },
      'internal_admin',
    );

    expect(response).toMatchSnapshot();
  });

  it('should add a new logic jump.', async () => {
    const newJump = {
      "conditions": [
        {
          "question": "UXVlc3Rpb246Mzk0Ng==",
          "value": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25DaG9pY2VKdW1wUXVlc3Rpb25SNA==",
          "operator": "IS"
        }
      ],
      "destination": "UXVlc3Rpb246MTQwNQ=="
    }

    const input = JSON.parse(JSON.stringify(defaultInput));
    input.questionsJumps[0].jumps.push(newJump);

    const response = await graphql(
      UpdateJumpsMutation,
      {input},
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });

  it('should remove a condition.', async () => {
    const input = JSON.parse(JSON.stringify(defaultInput));
    input.questionsJumps[0].jumps[0].conditions = input.questionsJumps[0].jumps[0].conditions.filter(condition => {
      return condition.id !== 'ljcLogicjumpQ1-1'
    });

    const response = await graphql(
      UpdateJumpsMutation,
      {input},
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });

  it('should remove a logic jump.', async () => {
    const newJump = {
      "conditions": [
        {
          "question": "UXVlc3Rpb246Mzk0Ng==",
          "value": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25DaG9pY2VKdW1wUXVlc3Rpb25SNA==",
          "operator": "IS"
        }
      ],
      "destination": "UXVlc3Rpb246MTQwNQ=="
    }

    const input = JSON.parse(JSON.stringify(defaultInput));
    input.questionsJumps[0].jumps = [newJump];

    const response = await graphql(
      UpdateJumpsMutation,
      {input},
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });

  it('should add a redirection.', async () => {
    const input = {
      "questionnaireId": "questionnaireJumps",
      "questionsJumps": [
        {
          "alwaysJumpDestinationQuestion": "UXVlc3Rpb246Mzk0Nw==",
          "questionId": "UXVlc3Rpb246Mzk0Ng==",
          "jumps": []
        }
      ]
    }

    const response = await graphql(
      UpdateJumpsMutation,
      {input},
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });


});