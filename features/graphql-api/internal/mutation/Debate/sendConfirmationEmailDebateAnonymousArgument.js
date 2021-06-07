/* eslint-env jest */
import '../../../_setup';

const SendConfirmationEmailDebateAnonymousArgumentMutation = /* GraphQL */ `
  mutation SendConfirmationEmailDebateAnonymousArgumentMutation(
    $input: SendConfirmationEmailDebateAnonymousArgumentInput!
  ) {
    sendConfirmationEmailDebateAnonymousArgument(input: $input) {
      errorCode
      debateArgument {
        id
      }
    }
  }
`;

describe('Internal|SendConfirmationEmailDebateAnonymousArgument mutation', () => {
  it('should successfully send again confirmation email.', async () => {
    // AGAINST / jesuisletokendudebateanonymousargumentagainst1
    const hash = 'QUdBSU5TVDpqZXN1aXNsZXRva2VuZHVkZWJhdGVhbm9ueW1vdXNhcmd1bWVudGFnYWluc3Qx';
    const response = await graphql(
      SendConfirmationEmailDebateAnonymousArgumentMutation,
      {
        input: {
          debate: toGlobalId('Debate', 'debateCannabis'),
          hash,
        },
      },
      'internal',
    );
    expect(response).toMatchSnapshot();
  });
  it('should error when the debate is unknown.', async () => {
    // FOR / jesuisletokendudebateanonymousargumentfor1
    const hash = 'Rk9SOmplc3Vpc2xldG9rZW5kdWRlYmF0ZWFub255bW91c2FyZ3VtZW50Zm9yMQ==';
    const response = await graphql(
      SendConfirmationEmailDebateAnonymousArgumentMutation,
      {
        input: {
          debate: 'nul',
          hash: hash,
        },
      },
      'internal',
    );
    expect(response).toMatchSnapshot();
  });
  it('should error when the debate is closed.', async () => {
    // FOR / jesuisletokendudebateanonymousargumentfor1
    const hash = 'Rk9SOmplc3Vpc2xldG9rZW5kdWRlYmF0ZWFub255bW91c2FyZ3VtZW50Zm9yMQ==';
    const response = await graphql(
      SendConfirmationEmailDebateAnonymousArgumentMutation,
      {
        input: {
          debate: toGlobalId('Debate', 'debateConfinement'),
          hash,
        },
      },
      'internal',
    );
    expect(response).toMatchSnapshot();
  });
  it('should error when the given hash is invalid.', async () => {
    const response = await graphql(
      SendConfirmationEmailDebateAnonymousArgumentMutation,
      {
        input: {
          debate: toGlobalId('Debate', 'debateCannabis'),
          hash: 'invalid',
        },
      },
      'internal',
    );
    expect(response).toMatchSnapshot();
  });
  it('should error when argument is already published.', async () => {
    // FOR / jesuisletokendudebateanonymousargumentfor1
    const hash = 'Rk9SOmplc3Vpc2xldG9rZW5kdWRlYmF0ZWFub255bW91c2FyZ3VtZW50Zm9yMQ==';
    const response = await graphql(
      SendConfirmationEmailDebateAnonymousArgumentMutation,
      {
        input: {
          debate: toGlobalId('Debate', 'debateCannabis'),
          hash,
        },
      },
      'internal',
    );
    expect(response).toMatchSnapshot();
  });
});
