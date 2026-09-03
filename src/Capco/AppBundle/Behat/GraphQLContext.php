<?php

namespace Capco\AppBundle\Behat;

use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\PyStringNode;
use Coduo\PHPMatcher\PHPMatcher;
use GuzzleHttp\Client;
use PHPUnit\Framework\Assert;

class GraphQLContext implements Context
{
    /**
     * @var Client
     */
    public $client;
    public $response;

    /**
     * @BeforeScenario
     */
    public function createClient()
    {
        $this->resetClient();
    }

    /**
     * @When I am logged in to graphql as admin
     */
    public function iAmLoggedInToGraphQLAsAdmin()
    {
        $this->createAuthenticatedClient('admin@test.com', 'admin');
    }

    /**
     * @When I am logged in to graphql as user
     */
    public function iAmLoggedInToGraphQLAsUser()
    {
        $this->createAuthenticatedClient('user@test.com', 'user');
    }

    /**
     * @Given I am logged in to graphql as super admin
     */
    public function iAmLoggedInToGraphQLAsSfavot()
    {
        $this->createAuthenticatedClient('sfavot@cap-collectif.com', 'toto');
    }

    /**
     * @When /^I send a GraphQL request:$/
     */
    public function iSendAraphQLQuery(PyStringNode $query)
    {
        $response = $this->client->request('POST', '/graphql/internal', [
            'body' => json_encode(['query' => $query->getRaw()]),
            'headers' => [
                'Content-Type' => 'application/json',
            ],
        ]);
        Assert::assertSame(200, (int) $response->getStatusCode());
        $this->response = (string) $response->getBody();
        Assert::assertFalse(isset(json_decode($this->response, true)['errors']), $this->response);
    }

    /**
     * @When /^I send a GraphQL POST request:$/
     */
    public function iSendAnInternalGraphQLPostRequest(PyStringNode $string)
    {
        $this->iSendAGraphQLPostRequest($string);
    }

    /**
     * @Then /^the JSON response should match:$/
     */
    public function theJsonResponseShouldMatch(PyStringNode $pattern)
    {
        $matcher = new PHPMatcher();
        Assert::assertTrue(
            $matcher->match($this->response, $pattern->getRaw()),
            $matcher->error() . ' ' . $this->response
        );
    }

    protected function createAuthenticatedClient(
        string $username = 'test',
        string $password = 'test'
    ): void {
        $this->resetClient();
        $response = $this->client->request('POST', '/login_check', [
            'headers' => ['Content-Type' => 'application/json'],
            'json' => ['username' => $username, 'password' => $password],
        ]);
    }

    private function resetClient(): void
    {
        $this->client = new Client([
            'base_uri' => 'https://capco.test/',
            'cert' => '/etc/ssl/certs/capco.pem',
            'verify' => false,
            'cookies' => true,
        ]);
    }

    private function iSendAGraphQLPostRequest(
        PyStringNode $string
    ) {
        $headers = [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'Origin' => 'https://capco.dev',
        ];

        // https://stackoverflow.com/questions/1176904/php-how-to-remove-all-non-printable-characters-in-a-string
        $string = preg_replace('/[\x00-\x1F\x7F]/u', '', $string->getRaw());

        $response = $this->client->request('POST', '/graphql/internal', [
            'json' => json_decode((string) $string, true),
            'headers' => $headers,
        ]);

        $this->response = (string) $response->getBody();
    }
}
