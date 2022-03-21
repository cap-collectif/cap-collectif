/* eslint-env jest */
const SmsCreditsQuery = /* GraphQL */ `
    query SmsCreditsQuery {
        smsOrders {
            edges {
                node {
                    id
                    amount
                }
            }
        }
    }
`;

describe('Internal|Query.smsCredits', () => {
  it('should list sms credits', async () => {
    await expect(graphql(SmsCreditsQuery, {}, 'internal_admin')).resolves.toMatchSnapshot();
  });
});
