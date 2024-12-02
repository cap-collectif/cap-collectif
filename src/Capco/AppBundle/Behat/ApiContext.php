<?php

namespace Capco\AppBundle\Behat;

use Behat\Gherkin\Node\PyStringNode;
use Behat\Gherkin\Node\TableNode;
use Coduo\PHPMatcher\PHPMatcher;
use GuzzleHttp\Client;
use PHPUnit\Framework\Assert;
use Psr\Http\Message\ResponseInterface;

class ApiContext extends ApplicationContext
{
    /**
     * @var Client
     */
    public $client;

    /** @var ResponseInterface */
    public $response;

    /**
     * @BeforeScenario
     */
    public function createClient()
    {
        $this->resetClient();
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
        $this->createAuthenticatedClient('sfavot@cap-collectif.com', 'toto');
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
        $this->createAuthenticatedClient('xlacot@cap-collectif.com', 'toto');
    }

    /**
     * @When I am logged in to api as :email with pwd :pwd
     */
    public function iAmLoggedInToApi(mixed $email, mixed $pwd)
    {
        $this->createAuthenticatedClient($email, $pwd);
    }

    /**
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with a valid opinion json$/
     */
    public function iSendOpinionRequest(mixed $method, mixed $url)
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
     */
    public function iSendReportRequest(mixed $method, mixed $url)
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
     */
    public function iSendARequest(mixed $method, mixed $url)
    {
        $this->response = $this->client->request($method, $url, [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'exceptions' => false,
        ]);
    }

    /**
     * @When /^(?:I )?send a ([A-Z]+) request to xml "([^"]+)"$/
     */
    public function iSendAXmlRequest(mixed $method, mixed $url)
    {
        $this->response = $this->client->request($method, $url, [
            'headers' => [
                'Content-Type' => 'application/xml',
            ],
            'exceptions' => false,
        ]);
    }

    /**
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with values:$/
     */
    public function iSendARequestWithValues(mixed $method, mixed $url, TableNode $table)
    {
        $this->response = $this->client->request($method, $url, [
            'json' => $table->getHash(),
            'exceptions' => false,
            'headers' => [],
        ]);
    }

    /**
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with json:$/
     */
    public function iSendARequestWithJsonFromPyString(mixed $method, mixed $url, PyStringNode $string)
    {
        $this->response = $this->client->request($method, $url, [
            'json' => json_decode($string->getRaw(), true),
            'exceptions' => false,
            'headers' => [
                'Content-Type' => 'application/json',
            ],
        ]);
    }

    /**
     * @When /^(?:I )?send a ([A-Z]+) request to "([^"]+)" with a document and an illustration$/
     */
    public function iSendARequestWithDocumentAndIllustration(mixed $method, mixed $url)
    {
        $json = <<<'EOF'
                    {
                        "title": "Acheter un sauna pour Capco",
                        "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
                        "theme": "theme1",
                        "district": "RGlzdHJpY3Q6ZGlzdHJpY3Qx",
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
            'headers' => [],
            'multipart' => $body,
        ]);
    }

    /**
     * @When /^(?:I )?send a "([A-Z]+)" request to "([^"]+)" with attached PDF file$/
     */
    public function iUploadPDFFile(string $method, string $url)
    {
        $body = [];
        $body[] = [
            'name' => 'file',
            'contents' => fopen('/var/www/features/files/document.pdf', 'r'),
            'filename' => 'document.pdf',
        ];
        $this->uploadFile($method, $url, $body);
    }

    /**
     * @When /^(?:I )?send a "([A-Z]+)" request to "([^"]+)" with attached CSV COMMA file$/
     */
    public function iUploadCSVCOMMAFile(string $method, string $url)
    {
        $body = [];
        $body[] = [
            'name' => 'file',
            'contents' => fopen('/var/www/features/files/CSV_COMMA.csv', 'r'),
            'filename' => 'CSV_COMMA.csv',
        ];
        $this->uploadFile($method, $url, $body);
    }

    /**
     * @When /^(?:I )?send a "([A-Z]+)" request to "([^"]+)" with attached CSV SEMICOLON file$/
     */
    public function iUploadCSVSEMICOLONFile(string $method, string $url)
    {
        $body = [];
        $body[] = [
            'name' => 'file',
            'contents' => fopen('/var/www/features/files/CSV_SEMICOLON.csv', 'r'),
            'filename' => 'CSV_SEMICOLON.csv',
        ];
        $this->uploadFile($method, $url, $body);
    }

    /**
     * @When /^(?:I )?send a "([A-Z]+)" request to "([^"]+)" with attached image file$/
     */
    public function iUploadImageFile(string $method, string $url)
    {
        $body = [];
        $body[] = [
            'name' => 'file',
            'contents' => fopen('/var/www/features/files/image.jpg', 'r'),
            'filename' => 'image.jpg',
        ];
        $this->uploadFile($method, $url, $body);
    }

    /**
     * @When /^(?:I )?send a "([A-Z]+)" request to "([^"]+)" with a stored XSS file$/
     */
    public function iUploadXSSFile(string $method, string $url)
    {
        $body = [];
        $body[] = [
            'name' => 'file',
            'contents' => fopen('/var/www/features/files/stored_xss', 'r'),
            'filename' => 'stored_xss',
        ];
        $this->uploadFile($method, $url, $body);
    }

    /**
     * @When /^(?:I )?send a "([A-Z]+)" request to "([^"]+)" with a stored XSS HTML file$/
     */
    public function iUploadXSSHTMLFile(string $method, string $url)
    {
        $body = [];
        $body[] = [
            'name' => 'file',
            'contents' => fopen('/var/www/features/files/stored_xss.html', 'r'),
            'filename' => 'stored_xss.html',
        ];
        $this->uploadFile($method, $url, $body);
    }

    /**
     * @When /^(?:I )?send a "([A-Z]+)" request to "([^"]+)" without attached file$/
     */
    public function iUploadWithoutFile(string $method, string $url)
    {
        $this->uploadFile($method, $url, []);
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
     * Checks that response has specific status code.
     *
     * @param string $code status code
     *
     * @Then /^(?:the )?XML response status code should be (\d+)$/
     */
    public function theXmlResponseStatusCodeShouldBe(int $code)
    {
        $this->theJsonResponseStatusCodeShouldBe($code);
    }

    /**
     * @Then /^the JSON response should match:$/
     */
    public function theJsonResponseShouldMatch(PyStringNode $pattern)
    {
        $body = (string) $this->response->getBody();
        $matcher = new PHPMatcher();
        Assert::assertTrue($matcher->match($body, $pattern->getRaw()), $matcher->error() ?? '');
    }

    /**
     * @Then proposal with id :id should be deleted
     */
    public function proposalWithIdShouldBeSoftDeleted(string $id)
    {
        $em = $this->getEntityManager();

        $filters = $em->getFilters();
        if ($filters->isEnabled('softdeleted')) {
            $filters->disable('softdeleted');
        }
        $proposal = $em->getRepository('CapcoAppBundle:Proposal')->find($id);

        Assert::assertTrue($proposal->isDeleted());
    }

    /**
     * Create a client with an authenticated cookie.
     */
    protected function createAuthenticatedClient(
        string $username = 'test',
        string $password = 'test'
    ) {
        $this->resetClient();
        $response = $this->client->request('POST', '/login_check', [
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
            'json' => ['username' => $username, 'password' => $password],
        ]);
    }

    private function uploadFile($method, $url, $body)
    {
        $this->response = $this->client->request($method, $url, [
            'headers' => [],
            'multipart' => $body,
        ]);
    }

    private function resetClient()
    {
        $this->client = new Client([
            'base_uri' => 'https://capco.test/',
            'cert' => '/etc/ssl/certs/capco.pem',
            'verify' => false,
            'cookies' => true,
        ]);
    }

    private function iSendARequestWithJson(string $method, string $url, string $body)
    {
        $this->response = $this->client->request($method, $url, [
            'json' => json_decode($body, true),
            'exceptions' => false,
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
        ]);
    }
}
