<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\Command\CreateCsvFromEventParticipantsCommand;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Toggle\Manager;
use Overblog\GraphQLBundle\Request\Executor;
use Psr\Log\NullLogger;
use Symfony\Component\Console\Tester\CommandTester;
use Symfony\Component\Filesystem\Filesystem;

/**
 * @internal
 *
 * @coversNothing
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Exercises targeted CLI exports against real fixtures in a temporary output directory.
 */
class ExportEventParticipantsCommandTest extends DatabaseCommandTestCase
{
    public static function featureFlagOverrides(): array
    {
        return [Manager::export => true, Manager::multilangue => false];
    }

    public function testExportsOnlyTheRequestedEvent(): void
    {
        $command = $this->eventCommand();
        $status = $command->execute(['--eventId' => 'event3', '--delimiter' => ',']);

        self::assertSame(0, $status, $command->getDisplay());
        $directory = $this->temporaryFilePath('public/export');
        $files = scandir($directory);
        \assert(false !== $files);
        self::assertSame(['participants-grenobleweb2015.csv'], array_values(array_diff($files, ['.', '..'])));
        $csv = file_get_contents($directory . '/participants-grenobleweb2015.csv');
        \assert(false !== $csv);
        self::assertStringContainsString('user_email,user_firstname,user_lastname,user_privateRegistration', $csv);
        self::assertStringContainsString('xlacot@cap-collectif.com,Xavier,Lacot,no', $csv);
    }

    public function testUnknownEventDoesNotExportOtherEvents(): void
    {
        $command = $this->eventCommand();

        self::assertSame(1, $command->execute(['--eventId' => 'missing-event']));
        self::assertStringContainsString('No eligible event found', $command->getDisplay());
        $files = scandir($this->temporaryFilePath('public/export'));
        \assert(false !== $files);
        self::assertSame([], array_values(array_diff($files, ['.', '..'])));
    }

    /**
     * @dataProvider ineligibleEvents
     */
    public function testIneligibleEventDoesNotExportOtherEvents(string $eventId, bool $guestListEnabled): void
    {
        $event = $this->entityManager->find(Event::class, $eventId);
        self::assertInstanceOf(Event::class, $event);
        $event->setGuestListEnabled($guestListEnabled);
        $this->entityManager->flush();
        $command = $this->eventCommand();

        self::assertSame(1, $command->execute(['--eventId' => $eventId]));
        self::assertStringContainsString('No eligible event found', $command->getDisplay());
        $files = scandir($this->temporaryFilePath('public/export'));
        \assert(false !== $files);
        self::assertSame([], array_values(array_diff($files, ['.', '..'])));
    }

    /**
     * @return iterable<string, array{string, bool}>
     */
    public static function ineligibleEvents(): iterable
    {
        yield 'awaiting review with registration enabled' => ['eventCreateByAUserReviewAwaiting', true];

        yield 'refused with registration enabled' => ['eventCreateByAUserReviewRefused', true];

        yield 'enabled event with registration disabled' => ['event3', false];
    }

    private function eventCommand(): CommandTester
    {
        (new Filesystem())->mkdir($this->temporaryFilePath('public/export'));
        $container = self::getContainer();

        $listener = $container->get(GraphQlAclListener::class);
        \assert($listener instanceof GraphQlAclListener);
        $traversor = $container->get(ConnectionTraversor::class);
        \assert($traversor instanceof ConnectionTraversor);
        $executor = $container->get(Executor::class);
        \assert($executor instanceof Executor);
        $repository = $container->get(EventRepository::class);
        \assert($repository instanceof EventRepository);
        $exportUtils = $container->get(ExportUtils::class);
        \assert($exportUtils instanceof ExportUtils);
        $manager = $container->get(Manager::class);
        \assert($manager instanceof Manager);

        return new CommandTester(new CreateCsvFromEventParticipantsCommand(
            $listener,
            $traversor,
            $executor,
            $this->temporaryFilePath(''),
            new NullLogger(),
            $repository,
            $exportUtils,
            $manager
        ));
    }
}
