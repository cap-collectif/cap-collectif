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
    public function testMatches(string $path, bool $withAuthorization, bool $expected): void
    {
        $request = Request::create($path, 'POST');
        if ($withAuthorization) {
            $request->headers->set('Authorization', 'Bearer api-key');
        }

        self::assertSame($expected, (new InternalGraphQLApiKeyRequestMatcher())->matches($request));
    }

    /**
     * @return iterable<string, array{path: string, withAuthorization: bool, expected: bool}>
     */
    public static function matchesProvider(): iterable
    {
        yield 'internal endpoint with API key' => [
            'path' => '/graphql/internal',
            'withAuthorization' => true,
            'expected' => true,
        ];

        yield 'internal endpoint with cookie authentication' => [
            'path' => '/graphql/internal',
            'withAuthorization' => false,
            'expected' => false,
        ];

        yield 'public endpoint with API key' => [
            'path' => '/graphql',
            'withAuthorization' => true,
            'expected' => false,
        ];
    }
}
