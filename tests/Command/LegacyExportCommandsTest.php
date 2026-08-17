<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Qandidate\Toggle\Context;
use Qandidate\Toggle\ContextFactory;
use Symfony\Component\Console\Tester\CommandTester;
use Symfony\Component\Filesystem\Filesystem;

/**
 * @internal
 * @coversNothing
 */
class LegacyExportCommandsTest extends DatabaseCommandTestCase
{
    private const EXPORT_DIRECTORY = __DIR__ . '/../../public/export';
    private const SNAPSHOT_DIRECTORY = __DIR__ . '/../../__snapshots__/exports';

    private Manager $featureManager;
    private Context $featureContext;
    private bool $exportInitialState;
    private bool $legacyUsersExportInitialState;
    private bool $multilangueInitialState;

    /** @var list<string> */
    private array $generatedFiles = [];

    protected function setUp(): void
    {
        parent::setUp();

        $featureManager = self::getContainer()->get(Manager::class);
        \assert($featureManager instanceof Manager);
        $this->featureManager = $featureManager;

        $contextFactory = self::getContainer()->get('qandidate.toggle.user_context_factory');
        \assert($contextFactory instanceof ContextFactory);
        $this->featureContext = $contextFactory->createContext();

        $this->exportInitialState = $this->isFeatureActive(Manager::export);
        $this->legacyUsersExportInitialState = $this->isFeatureActive(
            Manager::export_legacy_users
        );
        $this->multilangueInitialState = $this->isFeatureActive(Manager::multilangue);

        $this->featureManager->activate(Manager::export);
        $this->featureManager->activate(Manager::export_legacy_users);
        $this->featureManager->deactivate(Manager::multilangue);

        $snapshotUser = $this->entityManager->getRepository(User::class)->find('user5');
        \assert($snapshotUser instanceof User);
        $snapshotUser->setConsentInternalCommunication(true);
        $this->entityManager->flush();
    }

    protected function tearDown(): void
    {
        $filesystem = new Filesystem();
        foreach ($this->generatedFiles as $generatedFile) {
            $filesystem->remove($generatedFile);
        }

        $this->featureManager->set(Manager::export, $this->exportInitialState);
        $this->featureManager->set(
            Manager::export_legacy_users,
            $this->legacyUsersExportInitialState
        );
        $this->featureManager->set(Manager::multilangue, $this->multilangueInitialState);

        parent::tearDown();
    }

    /**
     * @dataProvider exportCommands
     *
     * @param array<string, bool|string> $arguments
     * @param list<string>               $expectedFiles
     */
    public function testExportMatchesBusinessSnapshots(
        string $commandName,
        array $arguments,
        array $expectedFiles
    ): void {
        $commandTester = $this->executeCommand($commandName, $arguments);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        $this->assertExportedFilesMatchSnapshots($expectedFiles);
    }

    /**
     * @return iterable<string, array{string, array<string, bool|string>, list<string>}>
     */
    public function exportCommands(): iterable
    {
        yield 'project contributors' => [
            'capco:export:projects-contributors',
            ['--delimiter' => ','],
            [
                'participants_appel-a-projets.csv',
                'participants_bp-avec-vote-classement.csv',
                'participants_budget-avec-vote-limite.csv',
                'participants_budget-participatif-rennes.csv',
                'participants_croissance-innovation-disruption.csv',
                'participants_depot-avec-selection-vote-budget.csv',
                'participants_depot-avec-selection-vote-simple.csv',
                'participants_le-p16-un-projet-a-base-de-riz.csv',
                'participants_project-pour-la-creation-de-la-capcobeer-visible-par-admin-seulement.csv',
                'participants_project-pour-la-force-visible-par-mauriau-seulement.csv',
                'participants_projet-a-venir.csv',
                'participants_projet-avec-questionnaire.csv',
                'participants_projet-avec-une-etape-de-participation-en-continue.csv',
                'participants_projet-de-loi-renseignement.csv',
                'participants_projet-sans-etapes-participatives.csv',
                'participants_projet-vide.csv',
                'participants_questions-responses.csv',
                'participants_qui-doit-conquerir-le-monde-visible-par-les-admins-seulement.csv',
                'participants_strategie-technologique-de-letat-et-services-publics.csv',
                'participants_transformation-numerique-des-relations.csv',
                'participants_un-avenir-meilleur-pour-les-nains-de-jardins-custom-access.csv',
            ],
        ];

        yield 'legacy users' => [
            'capco:export:legacyUsers',
            ['--delimiter' => ','],
            ['legacyUsers.csv'],
        ];

        yield 'event participants' => [
            'capco:export:events:participants',
            ['--delimiter' => ','],
            [
                'participants-event-with-registrations.csv',
                'participants-grenobleweb2015.csv',
            ],
        ];

        yield 'events' => [
            'capco:export:events',
            ['--delimiter' => ','],
            ['events.csv'],
        ];

        yield 'proposal analyses' => [
            'capco:export:analysis',
            ['--delimiter' => ','],
            [
                'project-budget-participatif-idf-analysis.csv',
                'project-project-analyse-analysis.csv',
                'project-projet-avec-administrateur-de-projet-analysis.csv',
                'project-projet-avec-administrateur-de-projet-analysis-project-admin.csv',
            ],
        ];

        yield 'proposal decisions' => [
            'capco:export:analysis',
            ['--delimiter' => ',', '--only-decisions' => true],
            [
                'project-budget-participatif-idf-decision.csv',
                'project-project-analyse-decision.csv',
                'project-projet-avec-administrateur-de-projet-decision.csv',
                'project-projet-avec-administrateur-de-projet-decision-project-admin.csv',
            ],
        ];

        yield 'mediator proposal votes' => [
            'capco:export:projects-mediators-proposals-votes',
            ['projectId' => 'project6', '--delimiter' => ','],
            ['mediators_proposals_votes_budget-participatif-rennes.csv'],
        ];
    }

    /**
     * @param array<string, bool|string> $arguments
     */
    private function executeCommand(string $commandName, array $arguments = []): CommandTester
    {
        $commandTester = $this->createCommandTester($commandName);
        $commandTester->execute($arguments);

        return $commandTester;
    }

    /** @param list<string> $expectedFiles */
    private function assertExportedFilesMatchSnapshots(array $expectedFiles): void
    {
        foreach ($expectedFiles as $expectedFile) {
            $exportPath = self::EXPORT_DIRECTORY . '/' . $expectedFile;
            $this->generatedFiles[] = $exportPath;

            self::assertFileEquals(self::SNAPSHOT_DIRECTORY . '/' . $expectedFile, $exportPath);
        }
    }

    private function isFeatureActive(string $feature): bool
    {
        return $this->featureManager->getToggleManager()->active($feature, $this->featureContext);
    }
}
