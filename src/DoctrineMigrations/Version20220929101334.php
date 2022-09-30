<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220929101334 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'district.cover';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE district ADD cover_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE district ADD CONSTRAINT FK_31C15487922726E9 FOREIGN KEY (cover_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_31C15487922726E9 ON district (cover_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE district DROP FOREIGN KEY FK_31C15487922726E9');
        $this->addSql('DROP INDEX IDX_31C15487922726E9 ON district');
        $this->addSql('ALTER TABLE district DROP cover_id');
    }
}
