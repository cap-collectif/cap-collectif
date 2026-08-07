<?php

namespace Capco\Tests\Controller\Api;

use Capco\AppBundle\Toggle\Manager;
use GuzzleHttp\Client;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\Request;

/**
 * @internal
 * @coversNothing
 */
class GraphQLControllerTest extends KernelTestCase
{
    private Manager $toggleManager;
    private bool $publicApiWasActive;

    protected function setUp(): void
    {
        self::bootKernel();

        $toggleManager = static::getContainer()->get(Manager::class);
        \assert($toggleManager instanceof Manager);
        $this->toggleManager = $toggleManager;
        $this->publicApiWasActive = $this->toggleManager->isActive(Manager::public_api);
        $this->toggleManager->activate(Manager::public_api);
    }

    protected function tearDown(): void
    {
        $this->toggleManager->set(Manager::public_api, $this->publicApiWasActive);

        parent::tearDown();
    }

    /**
     * @dataProvider graphQlEndpoints
     */
    public function testPreflightResponseHasTheExpectedCorsHeaders(string $path, string $origin): void
    {
        $response = $this->createClient()->request(Request::METHOD_OPTIONS, $path, [
            'headers' => ['Origin' => $origin],
        ]);

        self::assertSame(200, $response->getStatusCode());
        self::assertSame($origin, $response->getHeader('Access-Control-Allow-Origin')[0]);
        self::assertSame('OPTIONS, POST', $response->getHeader('Access-Control-Allow-Methods')[0]);
        self::assertSame("default-src 'none'", $response->getHeader('Content-Security-Policy')[0]);
    }

    /**
     * @dataProvider graphQlEndpoints
     */
    public function testPostRequestReturnsAnEmptyNodeList(string $path, string $origin): void
    {
        $response = $this->createClient()->request(
            Request::METHOD_POST,
            $path,
            [
                'headers' => ['Origin' => $origin],
                'json' => ['query' => '{ nodes(ids: []) { id } }'],
            ]
        );

        self::assertSame(200, $response->getStatusCode());
        $content = json_decode((string) $response->getBody(), true, 512, \JSON_THROW_ON_ERROR);

        self::assertSame([], $content['data']['nodes']);
    }

    public static function graphQlEndpoints(): \Generator
    {
        yield 'public API' => ['/graphql', '*'];
        yield 'internal API' => ['/graphql/internal', 'https://capco.dev'];
    }

    private function createClient(): Client
    {
        return new Client([
            'base_uri' => 'https://capco.test',
            'verify' => false,
        ]);
    }
}
