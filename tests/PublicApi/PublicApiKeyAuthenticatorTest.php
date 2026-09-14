<?php

declare(strict_types=1);

namespace Capco\Tests\PublicApi;

use Capco\AppBundle\PublicApi\PublicApiKeyAuthenticator;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;

/**
 * @internal
 *
 * @coversNothing
 */
class PublicApiKeyAuthenticatorTest extends TestCase
{
    /**
     * @dataProvider credentialsProvider
     */
    public function testGetCredentials(string $authorization, string $expected): void
    {
        $request = Request::create('/graphql/internal', 'POST');
        $request->headers->set('Authorization', $authorization);

        self::assertSame($expected, (new PublicApiKeyAuthenticator())->getCredentials($request));
    }

    /**
     * @return iterable<string, array{string, string}>
     */
    public static function credentialsProvider(): iterable
    {
        yield 'Bearer scheme' => ['Bearer Api-Key', 'Api-Key'];
        yield 'lowercase scheme' => ['bearer Api-Key', 'Api-Key'];
        yield 'uppercase scheme' => ['BEARER Api-Key', 'Api-Key'];
        yield 'mixed case scheme' => ['bEaReR Api-Key', 'Api-Key'];
        yield 'Basic credentials are not API keys' => ['Basic dXNlcjpwYXNzd29yZA==', 'Basic dXNlcjpwYXNzd29yZA=='];
        yield 'empty token' => ['Bearer ', ''];
        yield 'only strip the prefix' => ['Bearer invalid Bearer token', 'invalid Bearer token'];
    }

    /**
     * @dataProvider supportsProvider
     */
    public function testSupports(string $path, bool $withAuthorization, bool $expected): void
    {
        $request = Request::create($path, 'POST');
        if ($withAuthorization) {
            $request->headers->set('Authorization', 'Bearer api-key');
        }

        self::assertSame($expected, (new PublicApiKeyAuthenticator())->supports($request));
    }

    /**
     * @return iterable<string, array{path: string, withAuthorization: bool, expected: bool}>
     */
    public static function supportsProvider(): iterable
    {
        yield 'public GraphQL endpoint' => [
            'path' => '/graphql',
            'withAuthorization' => true,
            'expected' => true,
        ];

        yield 'internal GraphQL endpoint' => [
            'path' => '/graphql/internal',
            'withAuthorization' => true,
            'expected' => true,
        ];

        yield 'missing authorization header' => [
            'path' => '/graphql/internal',
            'withAuthorization' => false,
            'expected' => false,
        ];

        yield 'unrelated endpoint' => [
            'path' => '/graphql/preview',
            'withAuthorization' => true,
            'expected' => false,
        ];
    }
}
