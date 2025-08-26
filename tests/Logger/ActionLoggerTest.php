<?php

namespace Capco\Tests\Logger;

use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Logger\ActionLogger;
use Capco\AppBundle\Message\AppLogMessage;
use Capco\AppBundle\Utils\RequestGuesser;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Psr\Log\LogLevel;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\MessageBusInterface;

/**
 * @internal
 * @coversNothing
 */
class ActionLoggerTest extends TestCase
{
    private MockObject & MessageBusInterface $messageBus;
    private RequestGuesser $requestGuesser;
    private RequestStack $requestStack;
    private Request $request;
    private MockObject & LoggerInterface $logger;

    protected function setUp(): void
    {
        $this->request = new Request(server: ['REMOTE_ADDR' => '127.0.0.1']);

        $requestStack = new RequestStack();
        $requestStack->push($this->request);

        $this->requestStack = $requestStack;

        $this->messageBus = $this->createMock(MessageBusInterface::class);
        $this->requestGuesser = new RequestGuesser($requestStack);
        $this->logger = $this->createMock(LoggerInterface::class);
    }

    /**
     * @covers
     */
    public function testLogGraphQLQuery(): void
    {
        $user = new User();
        $user->setId(1);
        $user->setUsername('test');
        $user->setEmail('test@test.com');
        $user->addRole(UserRole::ROLE_ADMIN);

        $this->messageBus
            ->expects($this->once())
            ->method('dispatch')
            ->with(self::isInstanceOf(AppLogMessage::class))
            ->willReturn(new Envelope(new AppLogMessage(
                userId: $user->getId(),
                actionType: 'SHOW',
                description: 'de la liste des utilisateurs',
                entityType: null,
                entityId: null,
                ip: '127.0.0.1'
            )))
        ;

        $this->logger
            ->expects($this->never())
            ->method('log')
            ->with(LogLevel::ERROR, 'You can not access to this action.')
        ;

        $args = new Argument(['isLogged' => true]);

        $actionLogger = $this->init();
        $actual = $actionLogger->logGraphQLQuery($user, $args, 'SHOW', 'de la liste des utilisateurs');

        self::assertTrue($actual);
    }

    /**
     * @covers
     *
     * @dataProvider logGraphQLQueryWithErrorProvider
     */
    public function testLogGraphQLQueryWithError(
        ?User $user,
        ?Request $request,
        Argument $args
    ): void {
        $this->messageBus
            ->expects($this->never())
            ->method('dispatch')
        ;

        $this->logger
            ->expects($this->never())
            ->method('log')
            ->with(LogLevel::ERROR, 'You can not access to this action.')
        ;

        $actionLogger = $this->init();
        $actual = $actionLogger->logGraphQLQuery(null, $args, 'SHOW', 'de la liste des utilisateurs');

        self::assertFalse($actual);
    }

    public function logGraphQLQueryWithErrorProvider(): \Generator
    {
        yield 'with null user' => [
            'user' => null,
            'request' => new Request(server: ['REMOTE_ADDR' => '127.0.0.1']),
            'args' => new Argument(['isLogged' => true]),
        ];

        yield 'with null request' => [
            'user' => new User(),
            'request' => null,
            'args' => new Argument(['isLogged' => true]),
        ];

        yield 'with null isLogged argument' => [
            'user' => new User(),
            'request' => new Request(server: ['REMOTE_ADDR' => '127.0.0.1']),
            'args' => new Argument(),
        ];
    }

    /**
     * @covers
     */
    public function testLogExport(): void
    {
        $user = new User();
        $user->setId(1);
        $user->setUsername('test');
        $user->setEmail('test@test.com');
        $user->addRole(UserRole::ROLE_ADMIN);

        $this->messageBus
            ->expects($this->once())
            ->method('dispatch')
            ->with(self::isInstanceOf(AppLogMessage::class))
            ->willReturn(new Envelope(new AppLogMessage(
                userId: $user->getId(),
                actionType: 'SHOW',
                description: 'de la liste des utilisateurs',
                entityType: null,
                entityId: null,
                ip: '127.0.0.1'
            )))
        ;

        $this->logger
            ->expects($this->never())
            ->method('log')
            ->with(LogLevel::ERROR, 'You can not access to this action.')
        ;

        $actionLogger = $this->init();
        $actual = $actionLogger->logExport($user, 'de la liste des utilisateurs');

        self::assertTrue($actual);
    }

    /**
     * @covers
     */
    public function testLogGraphQLMutation(): void
    {
        $user = new User();
        $user->setId(1);
        $user->setUsername('test');
        $user->setEmail('test@test.com');
        $user->addRole(UserRole::ROLE_ADMIN);

        $this->messageBus
            ->expects($this->once())
            ->method('dispatch')
            ->with(self::isInstanceOf(AppLogMessage::class))
            ->willReturn(new Envelope(new AppLogMessage(
                userId: $user->getId(),
                actionType: 'SHOW',
                description: 'de la liste des utilisateurs',
                entityType: null,
                entityId: null,
                ip: '127.0.0.1'
            )))
        ;

        $this->logger
            ->expects($this->never())
            ->method('log')
            ->with(LogLevel::ERROR, 'You can not access to this action.')
        ;

        $actionLogger = $this->init();
        $actual = $actionLogger->logGraphQLMutation($user, 'CREATE', 'de la liste des utilisateurs');

        self::assertTrue($actual);
    }

    /**
     * @covers
     */
    public function testLogError(): void
    {
        $user = new User();
        $user->setId(1);
        $user->setUsername('test');
        $user->setEmail('test@test.com');
        $user->addRole(UserRole::ROLE_USER);

        $this->messageBus
            ->expects($this->never())
            ->method('dispatch')
        ;

        $this->logger
            ->expects($this->once())
            ->method('error')
            ->with('You can not access to this action.')
        ;

        $actionLogger = $this->init();
        $actionLogger->logExport($user, 'de la liste des utilisateurs');
    }

    private function init(): ActionLogger
    {
        return new ActionLogger($this->messageBus, $this->requestGuesser, $this->logger, $this->requestStack);
    }
}
