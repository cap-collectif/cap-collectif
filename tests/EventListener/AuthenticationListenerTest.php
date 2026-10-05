<?php

declare(strict_types=1);

namespace Capco\Tests\EventListener;

use Capco\AppBundle\EventListener\AuthenticationListener;
use Capco\AppBundle\Service\OpenIDBackchannel;
use Capco\AppBundle\Utils\RequestGuesserInterface;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\User\User;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;

/**
 * @internal
 *
 * @coversNothing
 */
final class AuthenticationListenerTest extends TestCase
{
    public function testDoesNotPersistStatelessUser(): void
    {
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::never())->method('persist');
        $entityManager->expects(self::never())->method('flush');

        $token = $this->createMock(TokenInterface::class);
        $token->method('getUser')->willReturn(new User('dev', null, ['ROLE_INTERNAL_HUB']));

        $listener = new AuthenticationListener(
            $entityManager,
            $this->createMock(RequestGuesserInterface::class),
            $this->createMock(OpenIDBackchannel::class),
            new NullLogger()
        );

        $listener->onAuthenticationSuccess(
            new InteractiveLoginEvent(Request::create('/graphql/internal'), $token)
        );
    }
}
