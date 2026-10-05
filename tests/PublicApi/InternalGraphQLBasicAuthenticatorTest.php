<?php

declare(strict_types=1);

namespace Capco\Tests\PublicApi;

use Capco\AppBundle\Client\OnePasswordClient;
use Capco\AppBundle\PublicApi\InternalGraphQLBasicAuthenticator;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\User\UserProviderInterface;

/**
 * @internal
 *
 * @coversNothing
 */
final class InternalGraphQLBasicAuthenticatorTest extends TestCase
{
    public function testAuthenticatesCredentialsFromOnePassword(): void
    {
        $authenticator = $this->createAuthenticator();
        $request = Request::create('/graphql/internal', 'POST');
        $request->headers->set('Authorization', 'Basic ' . base64_encode('dev:secret'));

        $user = $authenticator->getUser(
            $authenticator->getCredentials($request),
            $this->createMock(UserProviderInterface::class)
        );

        self::assertNotNull($user);
        self::assertSame('dev', $user->getUserIdentifier());
        self::assertContains(InternalGraphQLBasicAuthenticator::ROLE, $user->getRoles());
    }

    public function testRejectsInvalidPassword(): void
    {
        $authenticator = $this->createAuthenticator();
        $request = Request::create('/graphql/internal', 'POST');
        $request->headers->set('Authorization', 'Basic ' . base64_encode('dev:wrong'));

        $user = $authenticator->getUser(
            $authenticator->getCredentials($request),
            $this->createMock(UserProviderInterface::class)
        );

        self::assertNull($user);
    }

    private function createAuthenticator(): InternalGraphQLBasicAuthenticator
    {
        $httpClient = new MockHttpClient([
            new MockResponse(json_encode([
                ['id' => 'item-id', 'title' => 'dev'],
            ], \JSON_THROW_ON_ERROR)),
            new MockResponse(json_encode([
                'fields' => [
                    ['purpose' => 'USERNAME', 'value' => 'dev'],
                    ['purpose' => 'PASSWORD', 'value' => 'secret'],
                ],
            ], \JSON_THROW_ON_ERROR)),
            new MockResponse(json_encode([
                ['id' => 'item-id', 'title' => 'dev'],
            ], \JSON_THROW_ON_ERROR)),
            new MockResponse(json_encode([
                'fields' => [
                    ['purpose' => 'USERNAME', 'value' => 'dev'],
                    ['purpose' => 'PASSWORD', 'value' => 'secret'],
                ],
            ], \JSON_THROW_ON_ERROR)),
        ]);

        return new InternalGraphQLBasicAuthenticator(
            new OnePasswordClient($httpClient, 'https://connect.example', 'connect-token', 'vault'),
            'dev'
        );
    }
}
