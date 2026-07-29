<?php

namespace Capco\Tests\Controller\Site;

use Capco\AppBundle\Controller\Site\ModerationController;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @internal
 * @coversNothing
 */
class ModerationControllerTest extends KernelTestCase
{
    /**
     * @param array<string, string> $payload
     * @dataProvider moderatedContributions
     * @runInSeparateProcess
     * @preserveGlobalState disabled
     */
    public function testPublishesTheTrashMessage(string $token, string $reason, string $queue, array $payload): void
    {
        self::bootKernel();

        $publisher = $this->createMock(Publisher::class);
        $publisher
            ->expects(self::once())
            ->method('publish')
            ->with(
                $queue,
                self::callback(
                    static fn (Message $message): bool => $message->getBody() === json_encode($payload)
                )
            )
        ;

        $container = static::getContainer();
        $entityManager = $container->get('doctrine')->getManager();
        $connection = $entityManager->getConnection();
        $connection->beginTransaction();
        $translator = $this->createMock(TranslatorInterface::class);
        $translator->method('trans')->willReturn('translated');
        $controller = new ModerationController(
            $this->createMock(LoggerInterface::class),
            $translator,
            $publisher
        );
        $controller->setContainer($container);

        try {
            $response = $controller->moderateAction($token, $reason);

            self::assertTrue($response->isRedirection());
        } finally {
            $connection->rollBack();
            $entityManager->clear();
        }
    }

    public static function moderatedContributions(): \Generator
    {
        yield 'opinion' => [
            'opinion1ModerationToken',
            'reporting.status.sexual',
            'opinion.trash',
            ['opinionId' => 'opinion1'],
        ];

        yield 'argument' => [
            'argument1ModerationToken',
            'reporting.status.sexual',
            'argument.trash',
            ['argumentId' => 'argument1'],
        ];
    }
}
