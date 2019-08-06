<?php

namespace Capco\AppBundle\Behat;

use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\PyStringNode;
use Coduo\PHPMatcher\Factory\SimpleFactory;
use GuzzleHttp\Client;
use PHPUnit\Framework\Assert;

class GraphQLContext implements Context
{
    /**
     * @var Client
     */
    public $client;
    public $response;
    public $rawResponse;

    public $resultChecker = '';

    /**
     * @BeforeScenario
     */
    public function createClient()
    {
        $this->resetClient();
    }

    /**
     * @When I am logged in to graphql as :email with password :password
     */
    public function iAmLoggedInToGraphQLAs(string $email, string $password)
    {
        $this->createAuthenticatedClient($email, $password);
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
                'Content-Type' => 'application/graphql'
            ]
        ]);
        Assert::assertSame(200, (int) $response->getStatusCode());
        $this->response = (string) $response->getBody();
        Assert::assertFalse(isset(json_decode($this->response, true)['errors']), $this->response);
    }

    /**
     * @Then request header :header contains :value
     */
    public function headerContainsValue(string $header, string $value)
    {
        expect($this->rawResponse->getHeaders()[$header][0])->toBe($value);
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
     * @Given I send a public GraphQL OPTIONS request with origin :origin :
     */
    public function iSendAPreflightPublicGraphQLPostRequest(string $origin, PyStringNode $string)
    {
        $this->iSendAGraphQLPostRequest('public', $string, 'OPTIONS', $origin);
    }

    /**
     * @Given /^I send an internal GraphQL OPTIONS request:$/
     */
    public function iSendAPreflightInternalGraphQLPostRequest(PyStringNode $string)
    {
        $this->iSendAGraphQLPostRequest('internal', $string, 'OPTIONS');
    }

    /**
     * @When /^I send a GraphQL POST request:$/
     */
    public function iSendAnInternalGraphQLPostRequest(PyStringNode $string)
    {
        $this->iSendAGraphQLPostRequest('internal', $string);
    }

    /**
     * @When I send a public GraphQL POST request with origin :origin :
     */
    public function iSendAPublicGraphQLPostRequestWithOrigin(string $origin, PyStringNode $string)
    {
        $this->iSendAGraphQLPostRequest('public', $string, 'POST', $origin);
    }

    /**
     * @When I send an internal GraphQL POST request with origin :origin :
     */
    public function iSendAnInternalGraphQLPostRequestWithOrigin(
        string $origin,
        PyStringNode $string
    ) {
        $this->iSendAGraphQLPostRequest('internal', $string, 'POST', $origin);
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
    ): void {
        $this->resetClient();
        $response = $this->client->request('POST', '/login_check', [
            'headers' => ['Content-Type' => 'application/json'],
            'json' => ['username' => $username, 'password' => $password]
        ]);
    }

    private function resetClient(): void
    {
        $this->client = new Client([
            'base_uri' => 'https://capco.test/',
            'cert' => '/etc/ssl/certs/capco.pem',
            'verify' => false,
            'cookies' => true
        ]);
    }

    private function iSendAGraphQLPostRequest(
        string $schemaName,
        PyStringNode $string,
        string $method = 'POST',
        string $origin = 'https://capco.dev'
    ) {
        $endpoint = 'internal' === $schemaName ? '/graphql/internal' : '/graphql';
        $accept =
            'preview' === $schemaName
                ? 'application/vnd.cap-collectif.preview+json'
                : 'application/json';

        $headers = [
            'Content-Type' => 'application/json',
            'Accept' => $accept,
            'Origin' => $origin
        ];

        if ('OPTIONS' === $method) {
            // See https://github.com/nelmio/NelmioCorsBundle/issues/21#issuecomment-418023782
            $headers['Access-Control-Request-Method'] = 'POST';
            $headers['Access-Control-Request-Headers'] = 'test';
        }

        // https://stackoverflow.com/questions/1176904/php-how-to-remove-all-non-printable-characters-in-a-string
        $string = preg_replace('/[\x00-\x1F\x7F]/u', '', $string->getRaw());
        $response = $this->client->request($method, $endpoint, [
            'json' => json_decode($string, true),
            'headers' => $headers
        ]);
        $this->response = (string) $response->getBody();
        $this->rawResponse = $response;
    }
}
