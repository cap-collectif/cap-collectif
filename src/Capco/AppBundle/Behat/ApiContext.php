<?php

namespace Capco\AppBundle\Behat;

use Behat\Gherkin\Node\PyStringNode;
use Behat\Gherkin\Node\TableNode;
use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Coduo\PHPMatcher\Factory\SimpleFactory;
use Doctrine\ORM\Id\AssignedGenerator;
use GuzzleHttp\Client;
use PHPUnit_Framework_Assert as PHPUnit;

class ApiContext extends ApplicationContext
{
    /**
     * @var Client
     */
    public $client;
    public $token;
    public $response;

    /**
     * @BeforeScenario
     */
    public function createClient()
    {
        $this->client = new Client(['base_uri' => 'http://capco.test/']);
        $this->token = null;
    }

    /**
     * @When I am logged in to api as admin
     */
    public function iAmLoggedInToApiAsAdmin()
    {
        $this->createAuthenticatedClient('admin@test.com', 'admin');
    }

    /**
     * @When I am logged in to api as user
     */
    public function iAmLoggedInToApiAsUser()
    {
        $this->createAuthenticatedClient('user@test.com', 'user');
    }

    /**
     * @Given I am logged in to api as sfavot
     */
    public function iAmLoggedInToApiAsSfavot()
    {
        $this->createAuthenticatedClient('sfavot@jolicode.com', 'toto');
    }

    /**
     * @When I am logged in to api as user_not_confirmed
     */
    public function iAmLoggedInToApiAsUserNotConfirmed()
    {
        $this->createAuthenticatedClient('user_not_confirmed@test.com', 'user_not_confirmed');
    }

    /**
     * @When I am logged in to api as user_with_phone_not_phone_confirmed
     */
    public function iAmLoggedInToApiAsUserWithPhoneNotPhoneConfirmed()
    {
        $this->createAuthenticatedClient('user_with_phone_not_phone_confirmed@test.com', 'user_with_phone_not_phone_confirmed');
    }

    /**
     * @When I am logged in to api as user_without_phone
     */
    public function iAmLoggedInToApiAsUserWithoutPhone()
    {
        $this->createAuthenticatedClient('user_without_phone@test.com', 'user_without_phone');
    }

    /**
     * @When I am logged in to api as user_with_code_not_phone_confirmed
     */
    public function iAmLoggedInToApiAsUserWithSmsCode()
    {
        $this->createAuthenticatedClient('user_with_code_not_phone_confirmed@test.com', 'user_with_code_not_phone_confirmed');
    }

    /**
     * @When I am logged in to api as xlacot
     */
    public function iAmLoggedInToApiAsXlacot()
    {
        $this->createAuthenticatedClient('xlacot@jolicode.com', 'toto');
    }

    /**
     * @When I am logged in to api as :email with pwd :pwd
     *
     * @param mixed $email
     * @param mixed $pwd
     */
    public function iAmLoggedInToApi($email, $pwd)
    {
        $this->createAuthenticatedClient($email, $pwd);
    }

    /**
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with a valid source json$/
     *
     * @param mixed $method
     * @param mixed $url
     */
    public function iSendSourceRequest($method, $url)
    {
        $json = <<< 'EOF'
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
      * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with a valid opinion json$/
      *
      * @param mixed $method
      * @param mixed $url
      */
     public function iSendOpinionRequest($method, $url)
     {
         $json = <<< 'EOF'
       {
         "title": "Nouveau titre",
         "body": "Mes modifications blablabla"
       }
EOF;
         $this->iSendARequestWithJson($method, $url, $json);
     }

       /**
        * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with a valid link opinion json$/
        *
        * @param mixed $method
        * @param mixed $url
        */
       public function iSendOpinionLinkRequest($method, $url)
       {
           $json = <<< 'EOF'
         {
           "title": "Nouveau titre",
           "body": "Mes modifications blablabla",
           "OpinionType": "opinionType6"
         }
EOF;
           $this->iSendARequestWithJson($method, $url, $json);
       }

    /**
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with a valid report json$/
     *
     * @param mixed $method
     * @param mixed $url
     */
    public function iSendReportRequest($method, $url)
    {
        $json = <<< 'EOF'
        {
            "status": 2,
            "body": "Pas très catholique tout ça"
        }
EOF;

        $this->iSendARequestWithJson($method, $url, $json);
    }

    /**
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with a valid argument json$/
     *
     * @param mixed $method
     * @param mixed $url
     */
    public function iSendArgumentRequest($method, $url)
    {
        $json = <<< 'EOF'
        {
            "type": "1",
            "body": "Coucou, je suis un argument !"
        }
EOF;

        $this->iSendARequestWithJson($method, $url, $json);
    }

    /**
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with a valid argument update json$/
     *
     * @param mixed $method
     * @param mixed $url
     */
    public function iSendUpdateArgumentRequest($method, $url)
    {
        $json = <<< 'EOF'
        {
            "body": "Je suis un argument modifié."
        }
EOF;

        $this->iSendARequestWithJson($method, $url, $json);
    }

    /**
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with a valid idea json$/
     *
     * @param mixed $method
     * @param mixed $url
     */
    public function iSendIdeaRequest($method, $url)
    {
        $json = <<< 'EOF'
        {
            "title": "Ma nouvelle idée",
            "object": "Tester",
            "body": "Coucou, je suis une idée !",
            "url": "http://www.google.fr"
        }
EOF;

        $this->iSendARequestWithJson($method, $url, $json);
    }

    /**
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with a valid idea update json$/
     *
     * @param mixed $method
     * @param mixed $url
     */
    public function iSendUpdateIdeaRequest($method, $url)
    {
        $json = <<< 'EOF'
        {
            "title": "Nouveau titre de l'idée.",
            "object": "Tester",
            "body": "Coucou, je suis une idée !"
        }
EOF;

        $this->iSendARequestWithJson($method, $url, $json);
    }

    /**
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)"$/
     *
     * @param mixed $method
     * @param mixed $url
     */
    public function iSendARequest($method, $url)
    {
        $this->response = $this->client->request($method, $url, [
            'headers' => [
                'Authorization' => sprintf('Bearer %s', $this->token),
                'Content-Type' => 'application/json',
            ],
            'exceptions' => false,
        ]);
    }

    /**
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with values:$/
     *
     * @param mixed $method
     * @param mixed $url
     */
    public function iSendARequestWithValues($method, $url, TableNode $table)
    {
        $this->response = $this->client->request($method, $url, [
            'json' => $table->getHash(),
            'exceptions' => false,
            'headers' => ['Authorization' => sprintf('Bearer %s', $this->token)],
        ]);
    }

    /**
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with json:$/
     *
     * @param mixed $method
     * @param mixed $url
     */
    public function iSendARequestWithJsonFromPyString($method, $url, PyStringNode $string)
    {
        $this->response = $this->client->request($method, $url, [
            'json' => json_decode($string->getRaw(), true),
            'exceptions' => false,
            'headers' => [
                'Authorization' => sprintf('Bearer %s', $this->token),
                'Content-Type' => 'application/json',
            ],
        ]);
    }

    /**
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with a document and an illustration$/
     *
     * @param mixed $method
     * @param mixed $url
     */
    public function iSendARequestWithDocumentAndIllustration($method, $url)
    {
        $json = <<< 'EOF'
        {
            "title": "Acheter un sauna pour Capco",
            "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
            "theme": 1,
            "district": "1",
            "category": 1,
            "location": "[{\"address_components\":[{\"long_name\":\"18\",\"short_name\":\"18\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Parmentier\",\"short_name\":\"Avenue Parmentier\",\"types\":[\"route\"]},{\"long_name\":\"Paris\",\"short_name\":\"Paris\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Paris\",\"short_name\":\"Paris\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"\u00CEle-de-France\",\"short_name\":\"\u00CEle-de-France\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"75011\",\"short_name\":\"75011\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"18 Avenue Parmentier, 75011 Paris, France\",\"geometry\":{\"location\":{\"lat\":48.8599104,\"lng\":2.3791948},\"location_type\":\"ROOFTOP\",\"viewport\":{\"northeast\":{\"lat\":48.8612593802915,\"lng\":2.380543780291502},\"southwest\":{\"lat\":48.8585614197085,\"lng\":2.377845819708498}}},\"place_id\":\"ChIJC5NyT_dt5kcRq3u4vOAhdQs\",\"types\":[\"street_address\"]}]"
      }
EOF;

        $body = json_decode($json, true);

        $body['responses.0.question'] = 1;
        $body['responses.0.value'] = '';
        $body['responses.1.question'] = 3;
        $body['responses.1.value'] = 'Réponse à la question obligatoire';
        $body['responses.2.question'] = 8;

        array_walk($body, function (&$parameter, $key) {
            $parameter = ['name' => $key, 'contents' => $parameter];
        });

        $body[] = [
            'name' => 'responses.2.value.0',
            'contents' => fopen('/var/www/features/files/document.pdf', 'r'),
            'filename' => 'document.pdf',
        ];
        $body[] = [
            'name' => 'media',
            'contents' => fopen('/var/www/features/files/image.jpg', 'r'),
            'filename' => 'image.jpg',
        ];

        $this->response = $this->client->request($method, $url, [
            'headers' => ['Authorization' => sprintf('Bearer %s', $this->token)],
            'multipart' => $body,
        ]);
    }

    /**
     * Checks that response has specific status code.
     *
     * @param string $code status code
     *
     * @Then /^(?:the )?JSON response status code should be (\d+)$/
     */
    public function theJsonResponseStatusCodeShouldBe(int $code)
    {
        PHPUnit::assertSame(
            (int) $code,
            (int) $this->response->getStatusCode(),
            (string) $this->response->getBody()
        );
    }

    /**
     * @Then /^the JSON response should match:$/
     */
    public function theJsonResponseShouldMatch(PyStringNode $pattern)
    {
        $body = (string) $this->response->getBody();
        $factory = new SimpleFactory();
        $matcher = $factory->createMatcher();
        PHPUnit::assertTrue($matcher->match($body, $pattern->getRaw()), $matcher->getError());
    }

    /**
     * There is a synthesis with id and elements.
     *
     * @Given there is a synthesis with id :id and elements:
     *
     * @param mixed $id
     */
    public function thereIsASynthesisWithIdAndElements($id, TableNode $elementsIds)
    {
        $this->createSynthesisWithElements($id, $elementsIds);
    }

    /**
     * There is a synthesis with id and published elements.
     *
     * @Given there is a synthesis with id :id and published elements:
     *
     * @param mixed $id
     */
    public function thereIsASynthesisWithIdAndPublishedElements($id, TableNode $elementsIds)
    {
        $this->createSynthesisWithElements($id, $elementsIds, true);
    }

    /**
     * There is a synthesis with id based on consultation step.
     *
     * @Given there is a synthesis with id :sid based on consultation step :csId
     */
    public function thereIsASynthesisBasedOnConsultationStep(string $sId, string $csId)
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
     *
     * @param mixed $id
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
     *
     * @param mixed $id
     * @param mixed $sentence
     */
    public function thereShouldBeALogOnElementWithSentence($id, $sentence)
    {
        $element = $this->getEntityManager()->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->find($id);
        $logs = $this->getService('capco.synthesis.log_manager')->getLogEntries($element);
        $logExists = false;
        foreach ($logs as $log) {
            $sentences = $this->getService('capco.synthesis.log_manager')->getSentencesForLog($log);
            if (in_array($sentence, $sentences, true)) {
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
        $body = (string) $this->response->getBody();
        $data = json_decode($body, true);
        $elementId = $data['id'];
        $this->thereShouldBeALogOnElementWithSentence($elementId, 'Création de l\'élément');
    }

    /**
     * I update opinion with values.
     *
     * @Given I update opinion :id with values:
     *
     * @param mixed $id
     */
    public function iUpdateOpinionWithValues(string $id, TableNode $data)
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
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with synthesis display rules json$/
     *
     * @param mixed $method
     * @param mixed $url
     */
    public function iSendUpdateSynthesisDisplayRulesRequest($method, $url)
    {
        $json = <<< 'EOF'
        {
            "level": 1
        }
EOF;

        $this->iSendARequestWithJson($method, $url, $json);
    }

    /**
     * @Then the comments should be ordered by popularity
     */
    public function commentsOrderedByPopularity()
    {
        $max = 100000;
        $pinned = true;
        foreach (json_decode($this->response->getBody()->getContents(), true)['comments'] as $comment) {
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
     *
     * @param mixed $seconds
     */
    public function iDoNothingForXSeconds($seconds)
    {
        sleep($seconds);
    }

    /**
     * @Then proposal with id :id should be disable
     */
    public function proposalWithIdShouldBeSoftDeleted(int $id)
    {
        $em = $this->getEntityManager();
        $proposal = $em->getRepository('CapcoAppBundle:Proposal')->find($id);

        PHPUnit::assertFalse($proposal->isEnabled());
    }

    /**
     * Create a client with a an Authorization header.
     */
    protected function createAuthenticatedClient(string $username = 'test', string $password = 'test')
    {
        $response = $this->client->request(
            'POST',
            '/api/login_check',
            [
                'headers' => [
                  'X-Requested-With' => 'XMLHttpRequest',
                ],
                'json' => [
                    'username' => $username,
                    'password' => $password,
                ],
            ]
        );
        $body = (string) $response->getBody();
        $this->token = json_decode($body, true)['token'];
    }

    private function iSendARequestWithJson(string $method, string $url, string $body)
    {
        $this->response = $this->client->request($method, $url, [
            'json' => json_decode($body, true),
            'exceptions' => false,
            'headers' => [
                'Authorization' => sprintf('Bearer %s', $this->token),
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
        ]);
    }

    /**
     * Create a synthesis with elements.
     *
     * @param mixed $id
     * @param mixed $published
     */
    private function createSynthesisWithElements($id, TableNode $elementsIds, $published = false)
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
                $element->setPublished($published);

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
}
