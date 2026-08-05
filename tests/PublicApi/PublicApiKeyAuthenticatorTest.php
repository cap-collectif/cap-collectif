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
