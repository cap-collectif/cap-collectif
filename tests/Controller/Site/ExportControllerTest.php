<?php

namespace Capco\Tests\Controller\Site;

use Capco\AppBundle\Command\CreateCsvFromEventParticipantsCommand;
use Capco\AppBundle\Command\ExportAnalysisCSVCommand;
use Capco\AppBundle\Command\Service\FilePathResolver\ContributionsFilePathResolver;
use Capco\AppBundle\Command\Service\FilePathResolver\ParticipantsFilePathResolver;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Message\ExportOnDemandMessage;
use Capco\AppBundle\Message\ExportReadyEmailMessage;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\Tests\FeatureFlags\FeatureFlagsAwareTest;
use Capco\Tests\FeatureFlags\FeatureFlagsTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Stamp\ReceivedStamp;
use Symfony\Component\Messenger\Transport\InMemoryTransport;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * @internal
 *
 * @coversNothing
 */
class ExportControllerTest extends WebTestCase implements FeatureFlagsAwareTest
{
    use FeatureFlagsTrait;

    public static function featureFlagOverrides(): array
    {
        return ['export' => true];
    }

    /**
     * @runInSeparateProcess
     *
     * @preserveGlobalState disabled
     *
     * @dataProvider eventParticipantDownloads
     *
     * @phpunit-status compliant
     *
     * @phpunit-reason Exercises HTTP and real CSV generation, processing queued exports with an in-memory transport and restoring files on failure.
     */
    public function testEventAuthorOrAdminCanDownloadParticipants(
        string $email,
        string $eventId,
        int $participantCount,
        string $expectedParticipantEmail
    ): void {
        $client = self::createClient();
        $client->disableReboot();
        $client->setServerParameter('HTTP_ACCEPT_LANGUAGE', 'fr-FR');
        $transport = new InMemoryTransport();
        self::getContainer()->set('test.messenger.transport.async', $transport);
        $em = self::getContainer()->get(EntityManagerInterface::class);
        $user = $em->getRepository(User::class)->findOneBy(['email' => $email]);
        self::assertInstanceOf(User::class, $user);
        $client->loginUser($user);
        $event = $em->getRepository(Event::class)->find($eventId);
        self::assertInstanceOf(Event::class, $event);
        $fileName = CreateCsvFromEventParticipantsCommand::getFilename($event->getSlug());
        $filePath = self::getContainer()->getParameter('kernel.project_dir') . '/public/export/' . $fileName;
        $previousContents = is_file($filePath) ? file_get_contents($filePath) : null;
        if (null !== $previousContents) {
            self::assertIsString($previousContents);
        }

        try {
            if (is_file($filePath)) {
                unlink($filePath);
            }
            $client->request(Request::METHOD_GET, '/export-my-event-participants/' . $eventId);

            self::assertResponseIsSuccessful();
            $response = $client->getResponse();
            if (202 === $response->getStatusCode()) {
                $content = $response->getContent();
                self::assertIsString($content);
                self::assertSame(
                    ['errorTranslationKey' => 'export.requested'],
                    json_decode($content, true, 512, \JSON_THROW_ON_ERROR)
                );
                $envelopes = $transport->getSent();
                self::assertCount(1, $envelopes);
                $message = $envelopes[0]->getMessage();
                self::assertInstanceOf(ExportOnDemandMessage::class, $message);
                self::assertSame('capco:export:events:participants', $message->getCommandName());
                self::assertSame(['eventId' => $eventId], $message->getCommandOptions());
                self::assertSame($filePath, $message->getFilePath());
                self::getContainer()->get(MessageBusInterface::class)->dispatch(
                    $envelopes[0]->with(new ReceivedStamp('async'))
                );
                $sent = $transport->getSent();
                self::assertCount(2, $sent);
                self::assertInstanceOf(ExportReadyEmailMessage::class, $sent[1]->getMessage());
            } else {
                self::assertInstanceOf(BinaryFileResponse::class, $response);
                self::assertSame('text/csv; charset=utf-8', $response->headers->get('Content-Type'));
            }
            self::assertFileExists($filePath);
            $csv = file($filePath, \FILE_IGNORE_NEW_LINES);
            self::assertIsArray($csv);
            self::assertCount($participantCount + 1, $csv);
            $rows = array_map(static fn (string $line): array => str_getcsv($line, ';'), $csv);
            self::assertSame('user_email', ltrim((string) $rows[0][0], "\xEF\xBB\xBF"));
            self::assertContains($expectedParticipantEmail, array_column(\array_slice($rows, 1), 0));
        } finally {
            if (null !== $previousContents) {
                file_put_contents($filePath, $previousContents);
            } elseif (is_file($filePath)) {
                unlink($filePath);
            }
        }
    }

    /** @return iterable<string, array{string, string, int, string}> */
    public function eventParticipantDownloads(): iterable
    {
        yield 'admin, including the second page' => ['admin@test.com', 'event1', 51, 'lbrunet@cap-collectif.com'];

        yield 'event author' => ['user@test.com', 'event1', 51, 'lbrunet@cap-collectif.com'];

        yield 'event with anonymous registration' => ['admin@test.com', 'event4', 3, 'jpec@benkyou.com'];
    }

    /**
     * @runInSeparateProcess
     *
     * @preserveGlobalState disabled
     *
     * @phpunit-status non-compliant
     *
     * @phpunit-reason Creates and deletes shared export files without failure-safe restoration of their
     * initial contents.
     */
    public function testAdminCanDownloadProjectRelatedExports(): void
    {
        $client = $this->createAdminClient();
        $router = self::getContainer()->get('router');
        $contributionsFilePathResolver = self::getContainer()->get(ContributionsFilePathResolver::class);
        $stepRepository = self::getContainer()->get(AbstractStepRepository::class);

        foreach ([
            ['croissance-innovation-disruption', 'collecte-des-avis'],
            ['projet-avec-questionnaire', 'questionnaire-des-jo-2024'],
            ['budget-participatif-rennes', 'collecte-des-propositions'],
        ] as [$projectSlug, $stepSlug]) {
            $step = $stepRepository->getOneBySlugAndProjectSlug($stepSlug, $projectSlug);
            self::assertNotNull($step);

            $this->assertDownload(
                $client,
                $router->generate('app_project_download', [
                    'projectSlug' => $projectSlug,
                    'stepSlug' => $stepSlug,
                    'fromEmail' => 'true',
                ]),
                $contributionsFilePathResolver->getFullExportPath($step)
            );
        }

        $projectAnalysisFilePath = self::getContainer()->getParameter('kernel.project_dir') . '/public/export/' . ExportAnalysisCSVCommand::getFilename('project-analyse', false);
        $this->assertDownload(
            $client,
            $router->generate('app_project_analysis_download', ['projectSlug' => 'project-analyse']),
            $projectAnalysisFilePath
        );

        $projectDecisionFilePath = self::getContainer()->getParameter('kernel.project_dir') . '/public/export/' . ExportAnalysisCSVCommand::getFilename('project-analyse', true);
        $this->assertDownload(
            $client,
            $router->generate('app_project_decisions_download', ['projectSlug' => 'project-analyse']),
            $projectDecisionFilePath
        );

        $this->assertExportRequestAccepted(
            $client,
            $router->generate('app_export_project_contributors', ['projectId' => 'externalProject'])
        );
    }

    /**
     * @runInSeparateProcess
     *
     * @preserveGlobalState disabled
     *
     * @phpunit-status non-compliant
     *
     * @phpunit-reason Creates and deletes shared export files without failure-safe restoration of their
     * initial contents.
     */
    public function testAdminCanDownloadStepParticipantExportUsingRawAndGlobalIds(): void
    {
        $client = $this->createAdminClient();
        $stepRepository = self::getContainer()->get(AbstractStepRepository::class);
        $step = $stepRepository->find('selectionStepIdfVote');
        self::assertNotNull($step);

        $filePathResolver = self::getContainer()->get(ParticipantsFilePathResolver::class);
        $filePath = $filePathResolver->getFullExportPath($step);

        $this->assertDownload(
            $client,
            '/export-step-contributors/selectionStepIdfVote?fromEmail=true',
            $filePath
        );
        $this->assertDownload(
            $client,
            '/export-step-contributors/' . GlobalId::toGlobalId('SelectionStep', 'selectionStepIdfVote') . '?fromEmail=true',
            $filePath
        );
    }

    /**
     * @runInSeparateProcess
     *
     * @preserveGlobalState disabled
     *
     * @phpunit-status non-compliant
     *
     * @phpunit-reason Disables HTTP exception handling and expects an internal access-denied exception
     * instead of asserting the HTTP refusal.
     */
    public function testUserCannotExportAnotherProjectsParticipants(): void
    {
        $client = self::createClient();
        $user = self::getContainer()
            ->get(EntityManagerInterface::class)
            ->getRepository(User::class)
            ->findOneBy(['email' => 'user@test.com'])
        ;

        self::assertInstanceOf(User::class, $user);
        $client->loginUser($user);
        $client->catchExceptions(false);

        self::expectException(AccessDeniedException::class);
        $client->request('GET', '/export-step-contributors/selectionStepIdfVote?fromEmail=true');
    }

    private function createAdminClient(): KernelBrowser
    {
        $client = self::createClient();
        $user = self::getContainer()
            ->get(EntityManagerInterface::class)
            ->getRepository(User::class)
            ->findOneBy(['email' => 'admin@test.com'])
        ;

        self::assertInstanceOf(User::class, $user);
        $client->loginUser($user);
        $client->catchExceptions(false);

        return $client;
    }

    private function assertDownload(KernelBrowser $client, string $url, string $filePath): void
    {
        $directory = \dirname($filePath);
        if (!is_dir($directory)) {
            mkdir($directory, 0777, true);
        }
        file_put_contents($filePath, '');

        try {
            $client->request(Request::METHOD_GET, $url);
            self::assertSame(200, $client->getResponse()->getStatusCode(), $url);
        } finally {
            unlink($filePath);
        }
    }

    private function assertExportRequestAccepted(KernelBrowser $client, string $url): void
    {
        $client->disableReboot();
        $logger = self::getContainer()->get('monolog.logger');
        $handlers = $logger->getHandlers();
        $logger->setHandlers([]);

        try {
            $client->request(Request::METHOD_GET, $url);
        } finally {
            $logger->setHandlers($handlers);
        }

        self::assertContains($client->getResponse()->getStatusCode(), [200, 202], $url);
    }
}
