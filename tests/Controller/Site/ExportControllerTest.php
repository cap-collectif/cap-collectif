<?php

namespace Capco\Tests\Controller\Site;

use Capco\AppBundle\Command\ExportAnalysisCSVCommand;
use Capco\AppBundle\Command\Service\FilePathResolver\ContributionsFilePathResolver;
use Capco\AppBundle\Command\Service\FilePathResolver\ParticipantsFilePathResolver;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * @internal
 * @coversNothing
 */
class ExportControllerTest extends WebTestCase
{
    /**
     * @runInSeparateProcess
     * @preserveGlobalState disabled
     */
    public function testAdminCanRequestEventParticipantExport(): void
    {
        $client = $this->createAdminClient();
        $client->setServerParameter('HTTP_ACCEPT_LANGUAGE', 'fr-FR');

        $this->assertExportRequestAccepted(
            $client,
            '/export-my-event-participants/event1'
        );
    }

    /**
     * @runInSeparateProcess
     * @preserveGlobalState disabled
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
     * @preserveGlobalState disabled
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
     * @preserveGlobalState disabled
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
