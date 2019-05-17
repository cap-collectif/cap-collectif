<?php

namespace Capco\AppBundle\Behat;

use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\PyStringNode;
use Coduo\PHPMatcher\Factory\SimpleFactory;
use GuzzleHttp\Client;
use PHPUnit\Framework\Assert;

class GraphQLContext implements Context
{
    public $client;
    public $response;

    public $resultChecker = '';

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
     * @When I am logged in to graphql as user_not_confirmed_with_contributions
     */
    public function iAmLoggedInToGraphQLAsUserNotConfirmedWithContributions()
    {
        $this->createAuthenticatedClient(
            'user_not_confirmed_with_contributions@test.com',
            'user_not_confirmed_with_contributions'
        );
    }

    /**
     * @Given I am logged in to graphql as super admin
     */
    public function iAmLoggedInToGraphQLAsSfavot()
    {
        $this->createAuthenticatedClient('sfavot@jolicode.com', 'toto');
    }

    /**
     * @Given I am logged in to graphql as pierre
     */
    public function iAmLoggedInToGraphQLAsPierre()
    {
        $this->createAuthenticatedClient('pierre@cap-collectif.com', 'toto');
    }

    /**
     * @Given I am logged in to graphql as jean
     */
    public function iAmLoggedInToGraphQLAsJean()
    {
        $this->createAuthenticatedClient('jean@cap-collectif.com', 'toto');
    }

    /**
     * @Given I am logged in to graphql as lbrunet
     */
    public function iAmLoggedInToGraphQLAsLbrunet()
    {
        $this->createAuthenticatedClient('lbrunet@jolicode.com', 'toto');
    }

    /**
     * @When /^I send a GraphQL request:$/
     */
    public function iSendAraphQLQuery(PyStringNode $query)
    {
        $response = $this->client->request('GET', '/graphql/internal', [
            'query' => ['query' => $query->getRaw()],
            'headers' => [
                'Content-Type' => 'application/graphql',
            ],
        ]);
        Assert::assertSame(200, (int) $response->getStatusCode());
        $this->response = (string) $response->getBody();
        Assert::assertFalse(isset(json_decode($this->response, true)['errors']), $this->response);
    }

    /**
     * @Given I store the result
     */
    public function iStoreTheResult()
    {
        $this->resultChecker = $this->response;
    }

    /**
     * @Then the current result should not match with the stored result
     */
    public function compareWithStoredResult()
    {
        $body = $this->response;
        $factory = new SimpleFactory();
        $matcher = $factory->createMatcher();
        Assert::assertNotTrue($matcher->match($body, $this->resultChecker), $matcher->getError());
    }

    /**
     * @When /^I send a GraphQL POST request:$/
     */
    public function iSendAnInternalGraphQLPostRequest(PyStringNode $string)
    {
        $this->iSendAGraphQLPostRequest('internal', $string);
    }

    /**
     * @Then /^the JSON response should match:$/
     */
    public function theJsonResponseShouldMatch(PyStringNode $pattern)
    {
        $matcher = (new SimpleFactory())->createMatcher();
        Assert::assertTrue(
            $matcher->match($this->response, $pattern->getRaw()),
            $matcher->getError() . ' ' . $this->response
        );
    }

    protected function createAuthenticatedClient(
        string $username = 'test',
        string $password = 'test'
    ) {
        $this->resetClient();
        $response = $this->client->request('POST', '/login_check', [
            'headers' => ['Content-Type' => 'application/json'],
            'json' => ['username' => $username, 'password' => $password],
        ]);
    }

    private function resetClient()
    {
        $this->client = new Client([
            'base_uri' => 'https://capco.test/',
            'cert' => '/etc/ssl/certs/capco.pem',
            'verify' => false,
            'cookies' => true,
        ]);
    }

    private function iSendAGraphQLPostRequest(string $schemaName, PyStringNode $string)
    {
        $endpoint = 'internal' === $schemaName ? '/graphql/internal' : '/graphql';
        $accept =
            'preview' === $schemaName
                ? 'application/vnd.cap-collectif.preview+json'
                : 'application/json';

        // https://stackoverflow.com/questions/1176904/php-how-to-remove-all-non-printable-characters-in-a-string
        $string = preg_replace('/[\x00-\x1F\x7F]/u', '', $string->getRaw());
        $response = $this->client->request('POST', $endpoint, [
            'json' => json_decode($string, true),
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => $accept,
            ],
        ]);
        $this->response = (string) $response->getBody();
    }
}
