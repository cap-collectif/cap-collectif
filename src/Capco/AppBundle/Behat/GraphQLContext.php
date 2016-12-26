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
        $this->client = new Client(['base_url' => 'http://capco.test/']);
    }

    /**
     * @When /^I send a GraphQL request:$/
     */
    public function iSendAraphQLQuery(PyStringNode $query)
    {
        $request = $this->client->createRequest('GET', 'graphql/', [
            'exceptions' => false,
            'query' => ['query' => $query->getRaw()],
            'headers' => [
                'Content-Type' => 'application/graphql',
            ],
        ]);
        $urlQuery = $request->getQuery();
        $urlQuery->setEncodingType(Query::RFC1738);
        $request->setQuery($urlQuery);
        $response = $this->client->send($request);
        PHPUnit::assertSame(200, (int) $response->getStatusCode());
        $response->json(); // check if json
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
