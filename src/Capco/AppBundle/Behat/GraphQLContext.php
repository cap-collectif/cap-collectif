<?php

namespace Capco\AppBundle\Behat;

use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\PyStringNode;
use Coduo\PHPMatcher\PHPMatcher;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use PHPUnit\Framework\Assert;

class GraphQLContext implements Context
{
    /**
     * @var Client
     */
    public $client;
    public $response;
    public $rawResponse;
    public $statusCode;

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
     * @When I am logged in to graphql as VMD
     */
    public function iAmLoggedInToGraphQLAsVMD()
    {
        $this->createAuthenticatedClient('valerie.massondelmotte@cap-collectif.com', 'toto');
    }

    /**
     * @When I am logged in to graphql as user_without_phone
     */
    public function iAmLoggedInToGraphQLAsUserWithoutPhone()
    {
        $this->createAuthenticatedClient('user_without_phone@test.com', 'user_without_phone');
    }

    /**
     * @When I am logged in to graphql as Agui
     */
    public function iAmLoggedInToGraphQLAsAgui()
    {
        $this->createAuthenticatedClient('julien.aguilar@cap-collectif.com', 'toto');
    }

    /**
     * @When I am logged in to graphql as userNotConfirmedWithContributions
     */
    public function iAmLoggedInToGraphQLAsUserNotConfirmedWithContributions()
    {
        $this->createAuthenticatedClient(
            'userNotConfirmedWithContributions@test.com',
            'userNotConfirmedWithContributions'
        );
    }

    /**
     * @When I am logged in to graphql as user_not_confirmed
     */
    public function iAmLoggedInToGraphQLAsUserNotConfirmed()
    {
        $this->createAuthenticatedClient('user_not_confirmed@test.com', 'user_not_confirmed');
    }

    /**
     * @Given I am logged in to graphql as super admin
     */
    public function iAmLoggedInToGraphQLAsSfavot()
    {
        $this->createAuthenticatedClient('sfavot@cap-collectif.com', 'toto');
    }

    /**
     * @Given I am logged in to graphql as welcomatic
     */
    public function iAmLoggedInToGraphQLAsWelcomatic()
    {
        $this->createAuthenticatedClient('msantostefano@cap-collectif.com', 'capco');
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
        $this->createAuthenticatedClient('lbrunet@cap-collectif.com', 'toto');
    }

    /**
     * @Given I am logged in to graphql as theo
     */
    public function iAmLoggedInToGraphQLAsTheo()
    {
        $this->createAuthenticatedClient('theo@cap-collectif.com', 'toto');
    }

    /**
     * @Given I am logged out
     */
    public function iAmLoggedOut()
    {
        $this->resetClient();
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
     * @Then response header :header contains :value
     */
    public function headerContainsValue(string $header, string $value)
    {
        if ($this->rawResponse->getHeaders()[$header][0] !== $value) {
            throw new \RuntimeException(
                sprintf(
                    'Header %s does not contain %s',
                    $header,
                    $value
                )
            );
        }
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
        $matcher = new PHPMatcher();
        Assert::assertNotTrue($matcher->match($body, $this->resultChecker), $matcher->error());
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
     * @When /^I send a GraphQL POST request without throwing:$/
     */
    public function iSendAnInternalGraphQLPostRequestWithoutThrowing(PyStringNode $string)
    {
        $this->iSendAGraphQLPostRequest('internal', $string, 'POST', 'https://capco.dev', false);
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
        $matcher = new PHPMatcher();
        Assert::assertTrue(
            $matcher->match($this->response, $pattern->getRaw()),
            $matcher->error() . ' ' . $this->response
        );
    }

    /**
     * @Then the JSON response should have error :errorMessage
     */
    public function theJsonResponseShouldHaveError(string $errorMessage)
    {
        $found = 0;
        foreach (json_decode((string) $this->response)->errors as $responseError) {
            if ($responseError->message === $errorMessage) {
                ++$found;
            }
        }
        Assert::assertEquals(1, $found);
    }

    /**
     * @Then /^the GraphQL response status code should be (?P<code>\d+)$/
     *
     * @param mixed $statusCode
     */
    public function theGraphQLResponseStatusCodeShouldBe($statusCode)
    {
        Assert::assertEquals($statusCode, $this->statusCode);
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
        string $schemaName,
        PyStringNode $string,
        string $method = 'POST',
        string $origin = 'https://capco.dev',
        bool $shouldThrow = true
    ) {
        $endpoint = 'internal' === $schemaName ? '/graphql/internal' : '/graphql';
        $accept =
            'preview' === $schemaName
                ? 'application/vnd.cap-collectif.preview+json'
                : 'application/json';

        $headers = [
            'Content-Type' => 'application/json',
            'Accept' => $accept,
            'Origin' => $origin,
        ];

        // https://stackoverflow.com/questions/1176904/php-how-to-remove-all-non-printable-characters-in-a-string
        $string = preg_replace('/[\x00-\x1F\x7F]/u', '', $string->getRaw());

        try {
            $response = $this->client->request($method, $endpoint, [
                'json' => json_decode($string, true),
                'headers' => $headers,
            ]);

            $this->response = (string) $response->getBody();
            $this->rawResponse = $response;
            $this->statusCode = $response->getStatusCode();
        } catch (ClientException $exception) {
            if ($shouldThrow) {
                throw $exception;
            }
            // fail silently
            $this->response = (string) $exception->getResponse()->getBody();
            $this->rawResponse = $exception->getResponse();
            $this->statusCode = $exception->getResponse()->getStatusCode();
        }
    }
}
