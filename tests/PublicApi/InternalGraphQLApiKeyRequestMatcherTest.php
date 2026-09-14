<?php

declare(strict_types=1);

namespace Capco\Tests\PublicApi;

use Capco\AppBundle\PublicApi\InternalGraphQLApiKeyRequestMatcher;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;

/**
 * @internal
 *
 * @coversNothing
 */
class InternalGraphQLApiKeyRequestMatcherTest extends TestCase
{
    /**
     * @dataProvider matchesProvider
     */
    public function testMatches(string $path, ?string $authorization, bool $expected): void
    {
        $request = Request::create($path, 'POST');
        if (null !== $authorization) {
            $request->headers->set('Authorization', $authorization);
        }

        self::assertSame($expected, (new InternalGraphQLApiKeyRequestMatcher())->matches($request));
    }

    /**
     * @return iterable<string, array{path: string, authorization: ?string, expected: bool}>
     */
    public static function matchesProvider(): iterable
    {
        yield 'internal endpoint with API key' => [
            'path' => '/graphql/internal',
            'authorization' => 'Bearer api-key',
            'expected' => true,
        ];

        yield 'internal endpoint with cookie authentication' => [
            'path' => '/graphql/internal',
            'authorization' => null,
            'expected' => false,
        ];

        yield 'public endpoint with API key' => [
            'path' => '/graphql',
            'authorization' => 'Bearer api-key',
            'expected' => false,
        ];

        yield 'internal endpoint with Basic authentication' => [
            'path' => '/graphql/internal',
            'authorization' => 'Basic dXNlcjpwYXNzd29yZA==',
            'expected' => false,
        ];

        yield 'internal endpoint with lowercase Bearer scheme' => [
            'path' => '/graphql/internal',
            'authorization' => 'bearer api-key',
            'expected' => true,
        ];

        yield 'internal endpoint with uppercase Bearer scheme' => [
            'path' => '/graphql/internal',
            'authorization' => 'BEARER api-key',
            'expected' => true,
        ];

        yield 'internal endpoint with empty header' => [
            'path' => '/graphql/internal',
            'authorization' => '',
            'expected' => false,
        ];

        yield 'internal endpoint with another scheme containing Bearer' => [
            'path' => '/graphql/internal',
            'authorization' => 'Basic Bearer api-key',
            'expected' => false,
        ];

        yield 'internal endpoint with empty Bearer token' => [
            'path' => '/graphql/internal',
            'authorization' => 'Bearer ',
            'expected' => true,
        ];
    }
}
