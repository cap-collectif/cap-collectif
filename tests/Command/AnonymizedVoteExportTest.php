<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\Command\Service\FilePathResolver\ContributionsFilePathResolver;
use Capco\AppBundle\GraphQL\Resolver\User\ContributorNameResolver;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Translation\Loader\ArrayLoader;
use Symfony\Component\Translation\Translator;

/**
 * @internal
 *
 * @coversNothing
 */
final class AnonymizedVoteExportTest extends DatabaseCommandTestCase
{
    public function testSelectionVoteAuthorIsTranslatedInFullAndGroupedExports(): void
    {
        $this->entityManager->getConnection()->update('fos_user', [
            'username' => 'global.user.anonymized',
            'deleted_account_at' => '2020-01-01',
        ], ['id' => 'user5']);

        $this->assertExportedNames('selectionStepExport', 'selection/contributions_projet-pour-consolider-les-exports_selectionstepexport', [1058 => 'Profil anonymisé']);
    }

    public function testCollectVoteExportDistinguishesAnonymizedParticipantsFromActiveUsers(): void
    {
        $connection = $this->entityManager->getConnection();
        $connection->update('participant', [
            'username' => 'global.user.anonymized',
            'anonymized_at' => '2020-01-01',
        ], ['id' => 'participant3']);
        $connection->update('fos_user', ['username' => 'global.user.anonymized'], ['id' => 'user1']);

        $this->assertExportedNames('collectstepSmsVoteIdf3', 'collect/contributions_budget-participatif-idf-3_collecte-vote-par-sms', [
            2067 => 'global.user.anonymized',
            2069 => 'Profil anonymisé',
        ]);
    }

    /** @param array<int, string> $expectedNames */
    private function assertExportedNames(string $stepId, string $filename, array $expectedNames): void
    {
        $directory = $this->temporaryFilePath('');
        self::getContainer()->set(ContributionsFilePathResolver::class, new ContributionsFilePathResolver($directory));
        $translator = new Translator('fr-FR');
        $translator->addLoader('array', new ArrayLoader());
        $translator->addResource('array', ['global.user.anonymized' => 'Profil anonymisé'], 'fr-FR', 'CapcoAppBundle');
        self::getContainer()->set(ContributorNameResolver::class, new ContributorNameResolver($translator));

        $tester = $this->createCommandTester('capco:export:collect-selection:contributions');
        $tester->execute(['--stepId' => $stepId, '--force' => true]);
        $tester->assertCommandIsSuccessful();

        foreach (['.csv' => 'export_proposal_votes_author_username', '_grouped.csv' => 'export_participant_username'] as $suffix => $nameColumn) {
            $csv = file_get_contents($directory . $filename . $suffix);
            self::assertIsString($csv);
            $rows = (new CsvEncoder())->decode($csv, 'csv', [CsvEncoder::DELIMITER_KEY => ';']);
            $namesByVote = array_column($rows, $nameColumn, 'export_proposal_votes_id');
            foreach ($expectedNames as $voteId => $name) {
                self::assertSame($name, $namesByVote[$voteId]);
            }
        }
    }
}
