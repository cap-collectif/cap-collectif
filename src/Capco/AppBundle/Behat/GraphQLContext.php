<?php

namespace Capco\AppBundle\Behat;

use GuzzleHttp\Client;
use Behat\Gherkin\Node\PyStringNode;
use Coduo\PHPMatcher\Factory\SimpleFactory;
use PHPUnit_Framework_Assert as PHPUnit;
use GuzzleHttp\Query;
use Behat\Behat\Context\Context;

class GraphQLContext implements Context
{
    public $client;
    public $response;

    /**
     * @BeforeScenario
     */
    public function createClient()
    {
        $this->client = new Client(['base_uri' => 'http://capco.test/']);
    }

    /**
     * @When /^I send a GraphQL request:$/
     */
    public function iSendAraphQLQuery(PyStringNode $query)
    {
        $response = $this->client->request(
            'GET',
            '/graphql/',
            [
              'exceptions' => false,
              'query' => ['query' => $query->getRaw()],
              'headers' => [
                'Content-Type' => 'application/graphql',
              ],
            ]
        );
        PHPUnit::assertSame(200, (int) $response->getStatusCode());
        $this->response = (string) $response->getBody();
        PHPUnit::assertFalse(array_key_exists('errors', json_decode($this->response, true)), $this->response);
    }

    /**
     * @Then /^the JSON response should match:$/
     */
    public function theJsonResponseShouldMatch(PyStringNode $pattern)
    {
        $matcher = (new SimpleFactory())->createMatcher();
        PHPUnit::assertTrue($matcher->match($this->response, $pattern->getRaw()), $matcher->getError());
    }
}
