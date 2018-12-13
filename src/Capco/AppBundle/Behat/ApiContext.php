<?php

namespace Capco\AppBundle\Behat;

use Behat\Gherkin\Node\PyStringNode;
use Behat\Gherkin\Node\TableNode;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Capco\AppBundle\Manager\LogManager;
use Coduo\PHPMatcher\Factory\SimpleFactory;
use Doctrine\ORM\Id\AssignedGenerator;
use GuzzleHttp\Client;
use PHPUnit\Framework\Assert;

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
        $this->client = new Client([
            'base_uri' => 'https://capco.test/',
            'cert' => '/etc/ssl/certs/capco.pem',
            'verify' => false,
        ]);
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
        $this->createAuthenticatedClient(
            'user_with_phone_not_phone_confirmed@test.com',
            'user_with_phone_not_phone_confirmed'
        );
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
        $this->createAuthenticatedClient(
            'user_with_code_not_phone_confirmed@test.com',
            'user_with_code_not_phone_confirmed'
        );
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
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with a valid opinion json$/
     *
     * @param mixed $method
     * @param mixed $url
     */
    public function iSendOpinionRequest($method, $url)
    {
        $json = <<<'EOF'
       {
         "title": "Nouveau titre",
         "body": "Mes modifications blablabla"
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
        $json = <<<'EOF'
        {
            "status": 2,
            "body": "Pas très catholique tout ça"
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
        $json = <<<'EOF'
        {
            "title": "Acheter un sauna pour Capco",
            "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
            "theme": "theme1",
            "district": "district1",
            "category": "pCategory1",
            "address": "[{\"address_components\":[{\"long_name\":\"262\",\"short_name\":\"262\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Général Leclerc\",\"short_name\":\"Avenue Général Leclerc\",\"types\":[\"route\"]},{\"long_name\":\"Rennes\",\"short_name\":\"Rennes\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Ille-et-Vilaine\",\"short_name\":\"Ille-et-Vilaine\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Bretagne\",\"short_name\":\"Bretagne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"35700\",\"short_name\":\"35700\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"262 Avenue Général Leclerc, 35700 Rennes, France\",\"geometry\":{\"bounds\":{\"northeast\":{\"lat\":48.1140978,\"lng\":-1.6404985},\"southwest\":{\"lat\":48.1140852,\"lng\":-1.640499}},\"location\":{\"lat\":48.1140852,\"lng\":-1.6404985},\"location_type\":\"RANGE_INTERPOLATED\",\"viewport\":{\"northeast\":{\"lat\":48.1154404802915,\"lng\":-1.639149769708498},\"southwest\":{\"lat\":48.1127425197085,\"lng\":-1.641847730291502}}},\"place_id\":\"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\",\"types\":[\"street_address\"]}]"
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
        Assert::assertSame(
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
        Assert::assertTrue($matcher->match($body, $pattern->getRaw()), $matcher->getError() ?? '');
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
        $synthesis = $this->getEntityManager()
            ->getRepository(Synthesis::class)
            ->find($sId);

        if (null === $synthesis) {
            // Create synthesis
            $synthesis = new Synthesis();
            $synthesis->setEnabled(true);

            // Set id
            $synthesis->setId($sId);
            $metadata = $this->getEntityManager()->getClassMetadata(\get_class($synthesis));
            $metadata->setIdGenerator(new AssignedGenerator());

            $this->getEntityManager()->persist($synthesis);
            $this->getEntityManager()->flush();
        }

        $consultationStep = $this->getEntityManager()
            ->getRepository(ConsultationStep::class)
            ->find($csId);
        $this->getService('capco.synthesis.synthesis_handler')->createSynthesisFromConsultationStep(
            $synthesis,
            $consultationStep
        );
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
        $synthesis = $this->getEntityManager()
            ->getRepository('CapcoAppBundle:Synthesis\Synthesis')
            ->find($id);

        $element = new SynthesisElement();
        $element->setSynthesis($synthesis);

        if (isset($values['title'])) {
            $element->setTitle($values['title']);
        }
        if (isset($values['body'])) {
            $element->setBody($values['body']);
        } else {
            $element->setBody('blabla');
        }
        if (isset($values['notation'])) {
            $element->setNotation($values['notation']);
        }
        if (isset($values['published'])) {
            $element->setPublished(filter_var($values['published'], FILTER_VALIDATE_BOOLEAN));
        }
        if (isset($values['archived'])) {
            $element->setArchived(filter_var($values['archived'], FILTER_VALIDATE_BOOLEAN));
        }

        // Set id
        $element->setId($values['id']);
        $metadata = $this->getEntityManager()->getClassMetadata(\get_class($element));
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
        $element = $this->getEntityManager()
            ->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')
            ->find($id);
        $logs = $this->getService(LogManager::class)->getLogEntries($element);
        $logExists = false;
        foreach ($logs as $log) {
            $sentences = $this->getService(
                'Capco\AppBundle\Manager\LogManager'
            )->getSentencesForLog($log);
            if (\in_array($sentence, $sentences, true)) {
                $logExists = true;
                break;
            }
        }

        Assert::assertTrue($logExists);
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
        $opinion = $this->getEntityManager()
            ->getRepository('CapcoAppBundle:Opinion')
            ->find($id);

        if (null !== $opinion) {
            $values = $data->getRowsHash();
            if (isset($values['title'])) {
                $opinion->setTitle($values['title']);
            }
            if (isset($values['body'])) {
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
        $json = <<<'EOF'
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
        foreach (
            json_decode($this->response->getBody()->getContents(), true)['comments']
            as $comment
        ) {
            if ($pinned && !$comment['pinned']) {
                $max = 100000;
                $pinned = false;
            }
            Assert::assertGreaterThanOrEqual($comment['votesCount'], $max);
            $max = $comment['votesCount'];
        }
    }

    /**
     * @Then proposal with id :id should be deleted
     */
    public function proposalWithIdShouldBeSoftDeleted(string $id)
    {
        $em = $this->getEntityManager();
        $em->getFilters()->disable('softdeleted');
        $proposal = $em->getRepository('CapcoAppBundle:Proposal')->find($id);

        Assert::assertTrue($proposal->isDeleted());
    }

    /**
     * Create a client with a an Authorization header.
     */
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
        $synthesis = $this->getEntityManager()
            ->getRepository('CapcoAppBundle:Synthesis\Synthesis')
            ->find($id);
        $author = $this->getService('fos_user.user_manager')->findOneBy(['slug' => 'sfavot']);

        if (null === $synthesis) {
            // Create synthesis
            $synthesis = new Synthesis();
            $synthesis->setEnabled(true);

            // Set id
            $synthesis->setId($id);
            $metadata = $this->getEntityManager()->getClassMetadata(\get_class($synthesis));
            $metadata->setIdGenerator(new AssignedGenerator());

            $this->getEntityManager()->persist($synthesis);
        }

        foreach ($elementsIds->getRows() as $el) {
            $elId = $el[0];

            $element = $this->getEntityManager()
                ->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')
                ->find($elId);

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
                $metadata = $this->getEntityManager()->getClassMetadata(\get_class($element));
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
