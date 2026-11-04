<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261020120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Replace legacy anonymized profile names with the global.user.anonymized translation key';
    }

    public function up(Schema $schema): void
    {
        // Markers identify anonymized profiles independently of translated, missing or legacy names.
        $this->addSql(<<<'SQL'
            UPDATE fos_user
            SET username = 'global.user.anonymized', username_canonical = 'global.user.anonymized'
            WHERE deleted_account_at IS NOT NULL OR anonymized_at IS NOT NULL
            SQL);
        $this->addSql(<<<'SQL'
            UPDATE participant
            SET username = 'global.user.anonymized'
            WHERE anonymized_at IS NOT NULL
            SQL);
        // Anonymous arguments have no marker; match the historical purge signature byte for byte.
        $this->addSql(<<<'SQL'
            UPDATE debate_anonymous_argument
            SET username = 'global.user.anonymized'
            WHERE CAST(username AS BINARY) IN (CAST('Utilisateur supprimé' AS BINARY), CAST('deleted-user' AS BINARY))
              AND OCTET_LENGTH(email) = 0
            SQL);
    }

    public function down(Schema $schema): void
    {
        $this->throwIrreversibleMigrationException('The previous translated names cannot be reconstructed.');
    }
}
