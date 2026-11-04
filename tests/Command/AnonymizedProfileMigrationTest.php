<?php

namespace Capco\Tests\Command;

use Application\Migrations\Version20261020120000;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Participant;
use Doctrine\DBAL\Schema\Schema;
use Psr\Log\NullLogger;

/**
 * @internal
 *
 * @coversNothing
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Executes the migration SQL against real transactional data and checks stored names, idempotence and unaffected active identities; migration runner orchestration is outside this scope.
 */
final class AnonymizedProfileMigrationTest extends DatabaseCommandTestCase
{
    /** @dataProvider userMigrationCases */
    public function testMigratesOnlyAnonymizedUserNamesAndRemainsIdempotent(
        ?string $username,
        ?string $canonicalUsername,
        ?string $deletedAt,
        ?string $anonymizedAt,
        ?string $expectedUsername,
        ?string $expectedCanonicalUsername
    ): void {
        $connection = $this->entityManager->getConnection();
        // Reuse a persisted account; the provider defines its relevant identity and anonymization state.
        $userId = 'user190';
        $connection->update('fos_user', [
            'username' => $username,
            'username_canonical' => $canonicalUsername,
            'deleted_account_at' => $deletedAt,
            'anonymized_at' => $anonymizedAt,
        ], ['id' => $userId]);

        $unchangedFieldsQuery = 'SELECT email, slug, updated_at, deleted_account_at, anonymized_at FROM fos_user WHERE id = ?';
        $unchangedFields = $connection->fetchAssociative($unchangedFieldsQuery, [$userId]);

        for ($run = 0; $run < 2; ++$run) {
            $this->migrate();

            $row = $connection->fetchAssociative('SELECT username, username_canonical FROM fos_user WHERE id = ?', [$userId]);
            self::assertSame(['username' => $expectedUsername, 'username_canonical' => $expectedCanonicalUsername], $row);
            self::assertSame($unchangedFields, $connection->fetchAssociative($unchangedFieldsQuery, [$userId]));
        }
    }

    /** @return iterable<string, array{?string, ?string, ?string, ?string, ?string, ?string}> */
    public static function userMigrationCases(): iterable
    {
        yield 'manually deleted account' => ['Utilisateur supprimé', 'utilisateur supprimé', '2020-01-01', null, 'global.user.anonymized', 'global.user.anonymized'];

        yield 'automatically anonymized account' => ['Utilisateur supprimé', 'utilisateur supprimé', null, '2020-01-01', 'global.user.anonymized', 'global.user.anonymized'];

        yield 'active account with the same name' => ['Utilisateur supprimé', 'utilisateur supprimé', null, null, 'Utilisateur supprimé', 'utilisateur supprimé'];

        yield 'existing key with a legacy canonical name' => ['deleted-user', 'utilisateur supprimé', '2020-01-01', null, 'global.user.anonymized', 'global.user.anonymized'];

        yield 'already migrated account' => ['global.user.anonymized', 'global.user.anonymized', '2020-01-01', null, 'global.user.anonymized', 'global.user.anonymized'];

        yield 'active account with the legacy key' => ['deleted-user', 'deleted-user', null, null, 'deleted-user', 'deleted-user'];

        yield 'both anonymization markers' => ['Utilisateur supprimé', 'utilisateur supprimé', '2020-01-01', '2020-01-01', 'global.user.anonymized', 'global.user.anonymized'];

        yield 'English translated deletion' => ['Deleted user', 'deleted user', '2020-01-01', null, 'global.user.anonymized', 'global.user.anonymized'];

        yield 'another translated deletion' => ['Utilizator suprimit', 'utilizator suprimit', '2020-01-01', null, 'global.user.anonymized', 'global.user.anonymized'];

        yield 'missing anonymized identity' => [null, null, null, '2020-01-01', 'global.user.anonymized', 'global.user.anonymized'];

        yield 'empty anonymized identity' => ['', '', '2020-01-01', null, 'global.user.anonymized', 'global.user.anonymized'];

        yield 'unexpected stored anonymized name' => ['Previous author', 'previous author', null, '2020-01-01', 'global.user.anonymized', 'global.user.anonymized'];

        yield 'existing key without a canonical name' => ['deleted-user', null, '2020-01-01', null, 'global.user.anonymized', 'global.user.anonymized'];

        yield 'key with different case' => ['DELETED-USER', 'DELETED-USER', '2020-01-01', null, 'global.user.anonymized', 'global.user.anonymized'];

        yield 'ordinary active account' => ['Alice', 'alice', null, null, 'Alice', 'alice'];

        yield 'active account with a translated label' => ['Deleted user', 'deleted user', null, null, 'Deleted user', 'deleted user'];

        yield 'active account without a name' => [null, null, null, null, null, null];
    }

    /** @dataProvider participantMigrationCases */
    public function testMigratesOnlyAnonymizedParticipants(?string $username, bool $anonymized, ?string $expectedUsername): void
    {
        $participant = (new Participant())->setToken('20526-migration-participant')->setUsername($username);
        if ($anonymized) {
            $participant->setAnonymizedAt(new \DateTime('2020-01-01'));
        }
        $this->entityManager->persist($participant);
        $this->entityManager->flush();
        $connection = $this->entityManager->getConnection();
        $unchangedFieldsQuery = 'SELECT email, token, updated_at, anonymized_at FROM participant WHERE id = ?';
        $unchangedFields = $connection->fetchAssociative($unchangedFieldsQuery, [$participant->getId()]);

        for ($run = 0; $run < 2; ++$run) {
            $this->migrate();

            self::assertSame($expectedUsername, $connection->fetchOne('SELECT username FROM participant WHERE id = ?', [$participant->getId()]));
            self::assertSame($unchangedFields, $connection->fetchAssociative($unchangedFieldsQuery, [$participant->getId()]));
        }
    }

    /** @return iterable<string, array{?string, bool, ?string}> */
    public static function participantMigrationCases(): iterable
    {
        yield 'automatic purge label' => ['Utilisateur supprimé', true, 'global.user.anonymized'];

        yield 'global anonymization label' => ['Participant supprimé', true, 'global.user.anonymized'];

        yield 'translated label' => ['Deleted participant', true, 'global.user.anonymized'];

        yield 'missing name' => [null, true, 'global.user.anonymized'];

        yield 'empty name' => ['', true, 'global.user.anonymized'];

        yield 'legacy name key' => ['deleted-user', true, 'global.user.anonymized'];

        yield 'already migrated name' => ['global.user.anonymized', true, 'global.user.anonymized'];

        yield 'active user label' => ['Utilisateur supprimé', false, 'Utilisateur supprimé'];

        yield 'active participant label' => ['Participant supprimé', false, 'Participant supprimé'];

        yield 'active missing name' => [null, false, null];

        yield 'ordinary active participant' => ['Alice', false, 'Alice'];
    }

    /** @dataProvider debateArgumentMigrationCases */
    public function testMigratesOnlyTheExactDebatePurgeSignature(?string $username, string $email, ?string $expectedUsername): void
    {
        $argument = $this->entityManager->find(DebateAnonymousArgument::class, 'DebateAnonymousArgumentFor1');
        self::assertInstanceOf(DebateAnonymousArgument::class, $argument);
        $argument->setUsername($username)->setEmail($email);
        $this->entityManager->flush();
        $connection = $this->entityManager->getConnection();
        $unchangedFieldsQuery = 'SELECT email, body, debate_id, created_at, updated_at FROM debate_anonymous_argument WHERE id = ?';
        $unchangedFields = $connection->fetchAssociative($unchangedFieldsQuery, [$argument->getId()]);

        for ($run = 0; $run < 2; ++$run) {
            $this->migrate();

            self::assertSame($expectedUsername, $connection->fetchOne('SELECT username FROM debate_anonymous_argument WHERE id = ?', [$argument->getId()]));
            self::assertSame($unchangedFields, $connection->fetchAssociative($unchangedFieldsQuery, [$argument->getId()]));
        }
    }

    /** @return iterable<string, array{?string, string, ?string}> */
    public static function debateArgumentMigrationCases(): iterable
    {
        yield 'historical purge signature' => ['Utilisateur supprimé', '', 'global.user.anonymized'];

        yield 'same label with an email' => ['Utilisateur supprimé', 'active@example.com', 'Utilisateur supprimé'];

        yield 'whitespace email is not erased' => ['Utilisateur supprimé', ' ', 'Utilisateur supprimé'];

        yield 'case variant without a marker' => ['utilisateur supprimé', '', 'utilisateur supprimé'];

        yield 'accent variant without a marker' => ['Utilisateur supprime', '', 'Utilisateur supprime'];

        yield 'trailing space without a marker' => ['Utilisateur supprimé ', '', 'Utilisateur supprimé '];

        yield 'missing name without a marker' => [null, '', null];

        yield 'unrelated name without a marker' => ['Alice', '', 'Alice'];

        yield 'legacy purge key' => ['deleted-user', '', 'global.user.anonymized'];

        yield 'legacy key case variant without a marker' => ['DELETED-USER', '', 'DELETED-USER'];

        yield 'legacy key trailing space without a marker' => ['deleted-user ', '', 'deleted-user '];

        yield 'legacy key with an email' => ['deleted-user', 'active@example.com', 'deleted-user'];

        yield 'legacy key with a whitespace email' => ['deleted-user', ' ', 'deleted-user'];

        yield 'already migrated argument' => ['global.user.anonymized', '', 'global.user.anonymized'];
    }

    private function migrate(): void
    {
        require_once __DIR__ . '/../../src/DoctrineMigrations/Version20261020120000.php';
        $connection = $this->entityManager->getConnection();
        $migration = new Version20261020120000($connection, new NullLogger());
        $migration->up(new Schema());
        foreach ($migration->getSql() as $query) {
            $connection->executeStatement($query->getStatement(), $query->getParameters(), $query->getTypes());
        }
    }
}
