<?php

declare(strict_types=1);

namespace Capco\Tests\UnitTests;

use Capco\AppBundle\Client\OnePasswordClient;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;

/**
 * @covers \Capco\AppBundle\Client\OnePasswordClient
 *
 * @internal
 */
final class OnePasswordClientTest extends TestCase
{
    /**
     * @dataProvider invalidConfigurationProvider
     */
    public function testItRejectsInvalidConfiguration(
        string $connectUrl,
        string $connectToken,
        string $vaultId,
        string $exceptionMessage,
    ): void {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage($exceptionMessage);

        new OnePasswordClient(new MockHttpClient(), $connectUrl, $connectToken, $vaultId);
    }

    /**
     * @return array<int, array<int, string>>
     */
    public function invalidConfigurationProvider(): array
    {
        return [
            ['connect.example', 'connect-token', 'vault', '1Password Connect URL must be an absolute HTTP(S) URL.'],
            ['ftp://connect.example', 'connect-token', 'vault', '1Password Connect URL must be an absolute HTTP(S) URL.'],
            ['https://connect.example', ' ', 'vault', '1Password Connect token is required.'],
            ['https://connect.example', 'connect-token', ' ', '1Password vault ID is required.'],
        ];
    }

    public function testItRejectsAnEmptyItemName(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('1Password item name is required.');

        (new OnePasswordClient(new MockHttpClient(), 'https://connect.example', 'connect-token', 'vault'))
            ->credentials('  ')
        ;
    }

    public function testItResolvesCredentialsFromTheNamedItem(): void
    {
        $requests = [];
        $httpClient = $this->httpClient(
            [
                new MockResponse('[{"id":"item/id","title":"instance"}]'),
                new MockResponse('{"fields":[{"purpose":"USERNAME","value":"instance"},{"purpose":"PASSWORD","value":"password"}]}'),
            ],
            $requests,
        );

        $client = new OnePasswordClient($httpClient, 'https://connect.example/', 'connect-token', 'vault/id');

        self::assertSame(
            ['username' => 'instance', 'password' => 'password'],
            $client->credentials(' instance '),
        );
        self::assertSame(
            [
                ['GET', 'https://connect.example/v1/vaults/vault%2Fid/items'],
                ['GET', 'https://connect.example/v1/vaults/vault%2Fid/items/item%2Fid'],
            ],
            array_map(static fn (array $request): array => [$request['method'], $request['url']], $requests),
        );
        self::assertContains('Accept: application/json', $requests[0]['options']['headers']);
        self::assertContains('Authorization: Bearer connect-token', $requests[0]['options']['headers']);
        self::assertFalse($requests[0]['options']['buffer']);
    }

    public function testItRejectsAnUnknownItem(): void
    {
        $requests = [];
        $httpClient = $this->httpClient([new MockResponse('[{"id":"other","title":"other"}]')], $requests);

        $this->expectExceptionMessage('1Password item "instance" not found.');

        (new OnePasswordClient($httpClient, 'https://connect.example', 'connect-token', 'vault'))
            ->credentials('instance')
        ;
    }

    public function testItRejectsAUsernameThatDoesNotMatchTheItemName(): void
    {
        $requests = [];
        $httpClient = $this->httpClient(
            [
                new MockResponse('[{"id":"item","title":"instance"}]'),
                new MockResponse('{"fields":[{"purpose":"USERNAME","value":"other"},{"purpose":"PASSWORD","value":"password"}]}'),
            ],
            $requests,
        );

        $this->expectExceptionMessage('1Password item "instance" username does not match item name.');

        (new OnePasswordClient($httpClient, 'https://connect.example', 'connect-token', 'vault'))
            ->credentials('instance')
        ;
    }

    public function testItDoesNotExposeTheResponseBodyOnHttpErrors(): void
    {
        $requests = [];
        $httpClient = $this->httpClient([new MockResponse('secret response body', ['http_code' => 403])], $requests);

        $this->expectExceptionMessage('1Password Connect returned HTTP 403.');

        (new OnePasswordClient($httpClient, 'https://connect.example', 'connect-token', 'vault'))
            ->credentials('instance')
        ;
    }

    public function testItWrapsRequestErrors(): void
    {
        $httpClient = new MockHttpClient(static function (): MockResponse {
            throw new \RuntimeException('connection refused');
        });

        $this->expectExceptionMessage('1Password Connect request failed.');

        (new OnePasswordClient($httpClient, 'https://connect.example', 'connect-token', 'vault'))
            ->credentials('instance')
        ;
    }

    public function testItRejectsInvalidJson(): void
    {
        $httpClient = new MockHttpClient([
            new MockResponse('not-json'),
        ]);

        $this->expectExceptionMessage('Invalid JSON returned by 1Password Connect.');

        (new OnePasswordClient($httpClient, 'https://connect.example', 'connect-token', 'vault'))
            ->credentials('instance')
        ;
    }

    public function testItRejectsIncompleteLoginFields(): void
    {
        $httpClient = new MockHttpClient([
            new MockResponse('[{"id":"item","title":"instance"}]'),
            new MockResponse('{"fields":[{"purpose":"USERNAME","value":"instance"}]}'),
        ]);

        $this->expectExceptionMessage('1Password item "instance" has incomplete login fields.');

        (new OnePasswordClient($httpClient, 'https://connect.example', 'connect-token', 'vault'))
            ->credentials('instance')
        ;
    }

    public function testItRejectsResponsesLargerThanOneMiB(): void
    {
        $requests = [];
        $httpClient = $this->httpClient([new MockResponse(str_repeat('a', 1048577))], $requests);

        $this->expectExceptionMessage('1Password Connect response is too large.');

        (new OnePasswordClient($httpClient, 'https://connect.example', 'connect-token', 'vault'))
            ->credentials('instance')
        ;
    }

    /**
     * @param array<int, MockResponse>                                                      $responses
     * @param array<int, array{method: string, url: string, options: array<string, mixed>}> $requests
     */
    private function httpClient(array $responses, array &$requests): MockHttpClient
    {
        $responseIndex = 0;

        return new MockHttpClient(static function (string $method, string $url, array $options) use (&$requests, &$responseIndex, $responses): MockResponse {
            $requests[] = ['method' => $method, 'url' => $url, 'options' => $options];

            return $responses[$responseIndex++];
        });
    }
}
