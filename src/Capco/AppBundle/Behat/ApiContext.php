<?php

/**
 * @Copyright 2015 Aurélien David a.k.a "PretentiouSpyl" <adavid@jolicode.com>
 */

namespace Capco\AppBundle\Behat;

use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Capco\AppBundle\Entity\Synthesis\SynthesisLogItem;
use Doctrine\ORM\Id\AssignedGenerator;
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
     * @When /^I am logged in to api as admin$/
     */
    public function iAmLoggedInToApiAsAdmin()
    {
        $this->createAuthenticatedClient('admin@test.com', 'admin');
    }

    /**
     * @When /^I am logged in to api as user$/
     */
    public function iAmLoggedInToApiAsUser()
    {
        $this->createAuthenticatedClient('user@test.com', 'user');
    }

    /**
     * @When I am logged in to api as :username with pwd :pwd
     */
    public function iAmLoggedInToApi($username, $pwd)
    {
        $this->createAuthenticatedClient($username, $pwd);
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
            '/api/login_check',
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
     * There is a synthesis with id and elements
     *
     * @Given there is a synthesis with id :id and elements:
     */
    public function thereIsASynthesisWithIdAndElements($id, TableNode $elementsIds)
    {
        $synthesis = $this->getEntityManager()->getRepository('CapcoAppBundle:Synthesis\Synthesis')->find($id);

        if (null === $synthesis) {
            // Create synthesis
            $synthesis = new Synthesis();
            $synthesis->setEnabled(true);

            // Set id
            $synthesis->setId($id);
            $metadata = $this->getEntityManager()->getClassMetadata(get_class($synthesis));
            $metadata->setIdGenerator(new AssignedGenerator());

            $this->getEntityManager()->persist($synthesis);
        }

        foreach ($elementsIds->getRows() as $el) {

            $elId = $el[0];

            $element = $this->getEntityManager()->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->find($elId);

            if (null === $element) {

                // Create element
                $element = new SynthesisElement();
                $element->setSynthesis($synthesis);
                $element->setTitle('Je suis un nouvel élément');
                $element->setBody('blabla');
                $element->setNotation(4);

                // Set id
                $element->setId($elId);
                $metadata = $this->getEntityManager()->getClassMetadata(get_class($element));
                $metadata->setIdGenerator(new AssignedGenerator());

                // Generate logs for elements
                $this->getEntityManager()->persist($element);
                $this->getEntityManager()->flush();
                $element->setTitle('Je suis un élément');
                $this->getEntityManager()->persist($element);
                $this->getEntityManager()->flush();
            }
        }

        $this->getEntityManager()->flush();
    }

    /**
     * I create an element in synthesis with values
     *
     * @Given I create an element in synthesis :id with values:
     */
    public function iCreateAnElementInSynthesisWithValues($id, TableNode $data)
    {
        $values = $data->getRowsHash();
        $synthesis = $this->getEntityManager()->getRepository('CapcoAppBundle:Synthesis\Synthesis')->find($id);

        $element = new SynthesisElement();
        $element->setSynthesis($synthesis);

        if (array_key_exists('title', $values)) {
            $element->setTitle($values['title']);
        }
        if (array_key_exists('body', $values)) {
            $element->setBody($values['body']);
        } else {
            $element->setBody('blabla');
        }
        if (array_key_exists('notation', $values)) {
            $element->setNotation($values['notation']);
        }
        if (array_key_exists('enabled', $values)) {
            $element->setEnabled(filter_var($values['enabled'], FILTER_VALIDATE_BOOLEAN));
        }
        if (array_key_exists('archived', $values)) {
            $element->setArchived(filter_var($values['archived'], FILTER_VALIDATE_BOOLEAN));
        }

        // Set id
        $element->setId($values['id']);
        $metadata = $this->getEntityManager()->getClassMetadata(get_class($element));
        $metadata->setIdGenerator(new AssignedGenerator());

        $this->getEntityManager()->persist($element);
        $this->getEntityManager()->flush();
    }

    /**
     * There should be a log on element with sentence
     *
     * @Then there should be a log on element :id with sentence :sentence
     */
    public function thereShouldBeALogOnElementWithSentence($id, $sentence)
    {
        $element = $this->getEntityManager()->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->find($id);
        $logs = $this->getService('capco.synthesis.log_manager')->getLogEntries($element);
        $logExists = false;
        foreach ($logs as $log) {
            if ( in_array($sentence, $this->getService('capco.synthesis.log_manager')->getSentencesForLog($log))) {
                $logExists = true;
                break;
            }
        }

        \PHPUnit_Framework_Assert::assertTrue($logExists);
    }

    /**
     * There should be a created log on response element with username
     *
     * @Then there should be a create log on response element with username :username
     */
    public function thereShouldBeACreateLogOnResponseElement($username)
    {
        $this->response->json(); // check if json
        $body = (string) $this->response->getBody();
        $data = json_decode($body, true);
        $elementId = $data['id'];
        $this->thereShouldBeALogOnElementWithSentence($elementId, $username.' a créé l\'élément '.$elementId);
    }
}
