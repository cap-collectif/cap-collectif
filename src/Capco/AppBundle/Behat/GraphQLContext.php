<?php
namespace Capco\AppBundle\Behat;

use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\PyStringNode;
use Coduo\PHPMatcher\Factory\SimpleFactory;
use GuzzleHttp\Client;
use PHPUnit_Framework_Assert as PHPUnit;

class GraphQLContext implements Context
{
    public $client;
    public $response;
    public $token;

    public $resultChecker = '';

    /**
     * @BeforeScenario
     */
    public function createClient()
    {
        $this->client = new Client([
            'base_uri' => 'https://capco.test/',
            'cert' => '/etc/ssl/certs/capco.pem',
            'verify' => false,
        ]);
        $this->token = null;
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
     * @When /^I send a GraphQL request:$/
     */
    public function iSendAraphQLQuery(PyStringNode $query)
    {
        $response = $this->client->request('GET', '/graphql/', [
            'exceptions' => false,
            'query' => ['query' => $query->getRaw()],
            'headers' => [
                'Authorization' => sprintf('Bearer %s', $this->token),
                'Content-Type' => 'application/graphql',
            ],
        ]);
        PHPUnit::assertSame(200, (int) $response->getStatusCode());
        $this->response = (string) $response->getBody();
        PHPUnit::assertFalse(
            array_key_exists('errors', json_decode($this->response, true)),
            $this->response
        );
    }

    /**
     * @Given I store the result
     */
    public function iStoreTheResult()
    {
        $this->resultChecker = $this->response;
    }

    /**
     * @Then the current result should not math with the stored result
     */
    public function compareWithStoredResult()
    {
        $body = $this->response;
        $factory = new SimpleFactory();
        $matcher = $factory->createMatcher();
        PHPUnit::assertNotTrue($matcher->match($body, $this->resultChecker), $matcher->getError());
    }

    /**
     * @When /^I send a GraphQL POST request:$/
     */
    public function iSendAraphQLPostRequest(PyStringNode $string)
    {
        // https://stackoverflow.com/questions/1176904/php-how-to-remove-all-non-printable-characters-in-a-string
        $string = preg_replace('/[\x00-\x1F\x7F]/u', '', $string->getRaw());
        $response = $this->client->request('POST', '/graphql/', [
            'json' => json_decode($string, true),
            'exceptions' => false,
            'headers' => [
                'Authorization' => sprintf('Bearer %s', $this->token),
                'Content-Type' => 'application/json',
            ],
        ]);
        $this->response = (string) $response->getBody();
    }

    /**
     * @Then /^the JSON response should match:$/
     */
    public function theJsonResponseShouldMatch(PyStringNode $pattern)
    {
        $matcher = (new SimpleFactory())->createMatcher();
        PHPUnit::assertTrue(
            $matcher->match($this->response, $pattern->getRaw()),
            $matcher->getError() . ' ' . $this->response
        );
    }

    protected function createAuthenticatedClient(
        string $username = 'test',
        string $password = 'test'
    ) {
        $response = $this->client->request('POST', '/api/login_check', [
            'headers' => ['X-Requested-With' => 'XMLHttpRequest'],
            'json' => ['username' => $username, 'password' => $password],
        ]);
        $body = (string) $response->getBody();
        $this->token = json_decode($body, true)['token'];
    }
}
