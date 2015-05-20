<?php

namespace Capco\AppBundle\Behat;

use GuzzleHttp\Client;
use Behat\Gherkin\Node\PyStringNode;
use Behat\Gherkin\Node\TableNode;

class ApiContext extends ApplicationContext
{
    public $client;
    public $token;
    public $response;

    /**
     * @BeforeScenario
     */
    public function createClient()
    {
        $this->client = new Client(['base_url' => $this->getParameter('base.url')]);
        $this->token = null;
    }

    /**
     * @When /^I am logged in as "([^"]+)"$/
     */
    public function iAmLoggedIn($username)
    {
        $this->createAuthenticatedClient($username, $username);
    }

    /**
     * Create a client with a an Authorization header.
     *
     * @param string $username
     * @param string $password
     *
     */
    protected function createAuthenticatedClient($username = 'test', $password = 'test')
    {
        $request = $this->client->createRequest(
            'POST',
            '/login_check',
            [
                'body' => [
                    'username' => $username,
                    'password' => $password,
                ],
            ]
        );
        $response = $this->client->send($request);
        $this->token = $response->json()['token'];
    }

    /**
     * Sends HTTP request to specific relative URL.
     *
     * @param string $method request method
     * @param string $url    relative url
     *
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)"$/
     */
    public function iSendARequest($method, $url)
    {
        $url = '/app_test.php'.$url;
        $request = $this->client->createRequest($method, $url, [
            'headers' => [
                'Authorization' => sprintf('Bearer %s', $this->token),
                'Content-Type' => 'application/json'
            ],
            'exceptions' => false
        ]);
        $this->response = $this->client->send($request);
    }

    /**
     * Sends HTTP request to specific URL with field values from Table.
     *
     * @param string    $method request method
     * @param string    $url    relative url
     * @param TableNode $values table of values
     *
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with values:$/
     */
    public function iSendARequestWithValues($method, $url, TableNode $table)
    {
        $url = '/app_test.php'.$url;
        $request = $this->client->createRequest($method, $url, [
            'body' => $table->getHash(),
            'exceptions' => false,
            'headers' => ['Authorization' => sprintf('Bearer %s', $this->token)],
        ]);
        $this->response = $this->client->send($request);
    }

    /**
     * Sends HTTP request to specific URL with field values from Table.
     *
     * @param string    $method request method
     * @param string    $url    relative url
     * @param TableNode $values table of values
     *
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with json:$/
     */
    public function iSendARequestWithJson($method, $url, PyStringNode $string)
    {
        $url = '/app_test.php'.$url;
        $request = $this->client->createRequest($method, $url, [
            'body' => $string->getRaw(),
            'exceptions' => false,
            'headers' => [
                'Authorization' => sprintf('Bearer %s', $this->token),
                'Content-Type' => 'application/json'
            ],
        ]);
        $this->response = $this->client->send($request);
    }

    /**
     * Checks that response has specific status code.
     *
     * @param string $code status code
     *
     * @Then /^(?:the )?JSON response status code should be (\d+)$/
     */
    public function theJsonResponseStatusCodeShouldBe($code)
    {
        \PHPUnit_Framework_Assert::assertSame(
            intval($code),
            intval($this->response->getStatusCode()),
            (string) $this->response->getBody()
        );
    }

    /**
     * @Then /^the JSON response should match:$/
     */
    public function theJsonResponseShouldMatch(PyStringNode $pattern)
    {
        $this->response->json(); // check if json
        $body = (string) $this->response->getBody();
        \PHPUnit_Framework_Assert::assertTrue(match($body, $pattern->getRaw()), $body);
    }

    /**
     * I try to get random synthesis
     *
     * @When /^(?:I )?try to get random synthesis$/
     */
    public function itryToGetRandomSynthesis()
    {
        $synthesis = $this->getEntityManager()->getRepository('CapcoAppBundle:Synthesis\Synthesis')->findAll()[0];
        $this->iSendARequest('GET', '/api/syntheses/'.$synthesis->getId());
    }
}
