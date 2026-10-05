<?php

declare(strict_types=1);

namespace Capco\Tests\PublicApi;

use Capco\AppBundle\PublicApi\InternalGraphQLBasicRequestMatcher;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;

/**
 * @internal
 *
 * @coversNothing
 */
final class InternalGraphQLBasicRequestMatcherTest extends TestCase
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

        self::assertSame($expected, (new InternalGraphQLBasicRequestMatcher())->matches($request));
    }

    /**
     * @return iterable<string, array{path: string, authorization: ?string, expected: bool}>
     */
    public static function matchesProvider(): iterable
    {
        yield 'internal endpoint with Basic authentication' => [
            'path' => '/graphql/internal',
            'authorization' => 'Basic dXNlcjpwYXNzd29yZA==',
            'expected' => true,
        ];

        yield 'internal endpoint with API key' => [
            'path' => '/graphql/internal',
            'authorization' => 'Bearer api-key',
            'expected' => false,
        ];

        yield 'public endpoint with Basic authentication' => [
            'path' => '/graphql',
            'authorization' => 'Basic dXNlcjpwYXNzd29yZA==',
            'expected' => false,
        ];
    }
}
