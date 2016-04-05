<?php

/**
 * @Copyright 2015 Aurélien David a.k.a "PretentiouSpyl" <adavid@jolicode.com>
 */

namespace Capco\AppBundle\Behat;

use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Doctrine\ORM\Id\AssignedGenerator;
use GuzzleHttp\Client;
use Behat\Gherkin\Node\PyStringNode;
use Behat\Gherkin\Node\TableNode;
use Coduo\PHPMatcher\Factory\SimpleFactory;
use PHPUnit_Framework_Assert as PHPUnit;

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
        $this->client = new Client(['base_url' => 'http://capco.test/']);
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
     * @When /^I am logged in to api as xlacot$/
     */
    public function iAmLoggedInToApiAsXlacot()
    {
        $this->createAuthenticatedClient('xlacot@jolicode.com', 'toto');
    }

    /**
     * @When I am logged in to api as :email with pwd :pwd
     */
    public function iAmLoggedInToApi($email, $pwd)
    {
        $this->createAuthenticatedClient($email, $pwd);
    }

    /**
     * Create a client with a an Authorization header.
     *
     * @param string $username
     * @param string $password
     */
    protected function createAuthenticatedClient($username = 'test', $password = 'test')
    {
        $request = $this->client->createRequest(
            'POST',
            '/api/login_check',
            [
                'headers' => [
                  'X-Requested-With' => 'XMLHttpRequest',
                ],
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
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with a valid source json$/
     */
    public function iSendSourceRequest($method, $url)
    {
        $json = <<< EOF
        {
            "link": "http://google.com",
            "title": "Je suis une source",
            "body": "<div>Jai un corps mais pas de bras :'(</div>",
            "Category": 2
        }
EOF;

        $this->iSendARequestWithJson($method, $url, $json);
    }

    /**
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with a valid report json$/
     */
    public function iSendReportRequest($method, $url)
    {
        $json = <<< EOF
        {
            "status": 2,
            "body": "Pas très catholique tout ça"
        }
EOF;

        $this->iSendARequestWithJson($method, $url, $json);
    }

    /**
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with a valid argument json$/
     */
    public function iSendArgumentRequest($method, $url)
    {
        $json = <<< EOF
        {
            "type": "1",
            "body": "Coucou, je suis un argument !"
        }
EOF;

        $this->iSendARequestWithJson($method, $url, $json);
    }

    /**
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with a valid argument update json$/
     */
    public function iSendUpdateArgumentRequest($method, $url)
    {
        $json = <<< EOF
        {
            "body": "Je suis un argument modifié."
        }
EOF;

        $this->iSendARequestWithJson($method, $url, $json);
    }

    /**
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)"$/
     */
    public function iSendARequest($method, $url)
    {
        $request = $this->client->createRequest($method, $url, [
            'headers' => [
                'Authorization' => sprintf('Bearer %s', $this->token),
                'Content-Type' => 'application/json',
            ],
            'exceptions' => false,
        ]);
        $this->response = $this->client->send($request);
    }

    /**
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
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with json:$/
     */
    public function iSendARequestWithJsonFromPyString($method, $url, PyStringNode $string)
    {
        $request = $this->client->createRequest($method, $url, [
            'body' => $string->getRaw(),
            'exceptions' => false,
            'headers' => [
                'Authorization' => sprintf('Bearer %s', $this->token),
                'Content-Type' => 'application/json',
            ],
        ]);
        $this->response = $this->client->send($request);
    }

    private function iSendARequestWithJson($method, $url, $body)
    {
        $request = $this->client->createRequest($method, $url, [
            'body' => $body,
            'exceptions' => false,
            'headers' => [
                'Authorization' => sprintf('Bearer %s', $this->token),
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
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
        PHPUnit::assertSame(
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
        // $factory = new SimpleFactory();
        // $matcher = $factory->createMatcher();
        $this->response->json(); // check if json
        $body = (string) $this->response->getBody();
    }

    /**
     * There is a synthesis with id and elements.
     *
     * @Given there is a synthesis with id :id and elements:
     */
    public function thereIsASynthesisWithIdAndElements($id, TableNode $elementsIds)
    {
        $synthesis = $this->getEntityManager()->getRepository('CapcoAppBundle:Synthesis\Synthesis')->find($id);
        $author = $this->getService('fos_user.user_manager')->findOneBy(['slug' => 'sfavot']);

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
                $element->setVotes(['-1' => 21, '0' => 12, '1' => 43]);
                $element->setAuthor($author);

                // Set id
                $element->setId($elId);
                $metadata = $this->getEntityManager()->getClassMetadata(get_class($element));
                $metadata->setIdGenerator(new AssignedGenerator());

                // Generate logs for elements
                $this->getEntityManager()->persist($element);
                $this->getEntityManager()->flush();
                $element->setTitle('Je suis un élément');
                $this->getEntityManager()->persist($element);
            }
        }

        $this->getEntityManager()->flush();
    }

    /**
     * There is a synthesis with id base on consultation step.
     *
     * @Given there is a synthesis with id :sid based on consultation step :csId
     */
    public function thereIsASynthesisBasedOnConsultationStep($sId, $csId)
    {
        $synthesis = $this->getEntityManager()->getRepository('CapcoAppBundle:Synthesis\Synthesis')->find($sId);

        if (null === $synthesis) {
            // Create synthesis
            $synthesis = new Synthesis();
            $synthesis->setEnabled(true);

            // Set id
            $synthesis->setId($sId);
            $metadata = $this->getEntityManager()->getClassMetadata(get_class($synthesis));
            $metadata->setIdGenerator(new AssignedGenerator());

            $this->getEntityManager()->persist($synthesis);
            $this->getEntityManager()->flush();
        }

        $consultationStep = $this->getEntityManager()->getRepository('CapcoAppBundle:Steps\ConsultationStep')->find($csId);
        $this->getService('capco.synthesis.synthesis_handler')->createSynthesisFromConsultationStep($synthesis, $consultationStep);
    }

    /**
     * I create an element in synthesis with values.
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
        if (array_key_exists('published', $values)) {
            $element->setPublished(filter_var($values['published'], FILTER_VALIDATE_BOOLEAN));
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
     * There should be a log on element with sentence.
     *
     * @Then there should be a log on element :id with sentence :sentence
     */
    public function thereShouldBeALogOnElementWithSentence($id, $sentence)
    {
        $element = $this->getEntityManager()->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->find($id);
        $logs = $this->getService('capco.synthesis.log_manager')->getLogEntries($element);
        $logExists = false;
        foreach ($logs as $log) {
            $sentences = $this->getService('capco.synthesis.log_manager')->getSentencesForLog($log);
            if (in_array($sentence, $sentences)) {
                $logExists = true;
                break;
            }
        }

        PHPUnit::assertTrue($logExists);
    }

    /**
     * There should be a created log on response element.
     *
     * @Then there should be a create log on response element
     */
    public function thereShouldBeACreateLogOnResponseElement()
    {
        $this->response->json(); // check if json
        $body = (string) $this->response->getBody();
        $data = json_decode($body, true);
        $elementId = $data['id'];
        $this->thereShouldBeALogOnElementWithSentence($elementId, 'Création de l\'élément');
    }

    /**
     * I update opinion with values.
     *
     * @Given I update opinion :id with values:
     */
    public function iUpdateOpinionWithValues($id, TableNode $data)
    {
        $opinion = $this->getEntityManager()->getRepository('CapcoAppBundle:Opinion')->find($id);

        if (null !== $opinion) {
            $values = $data->getRowsHash();
            if (array_key_exists('title', $values)) {
                $opinion->setTitle($values['title']);
            }
            if (array_key_exists('body', $values)) {
                $opinion->setBody($values['body']);
            }

            $this->getEntityManager()->persist($opinion);
            $this->getEntityManager()->flush();
        }
    }

    /**
     * @Then the comments should be ordered by popularity
     */
    public function commentsOrderedByPopularity()
    {
        $max = 100000;
        $pinned = true;
        foreach ($this->response->json()['comments'] as $comment) {
            if ($pinned && !$comment['pinned']) {
                $max = 100000;
                $pinned = false;
            }
            PHPUnit::assertGreaterThanOrEqual($comment['votes_count'], $max);
            $max = $comment['votes_count'];
        }
    }

    /**
     * I do nothing for x seconds.
     *
     * @Given I do nothing for :seconds seconds
     */
    public function iDoNothingForXSeconds($seconds)
    {
        sleep($seconds);
    }
}
