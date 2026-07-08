<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260708160000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add participant relation to responses';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE response ADD participant_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('CREATE INDEX IDX_3E7B0BFB9D1C3019 ON response (participant_id)');
        $this->addSql('ALTER TABLE response ADD CONSTRAINT FK_3E7B0BFB9D1C3019 FOREIGN KEY (participant_id) REFERENCES participant (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE response DROP FOREIGN KEY FK_3E7B0BFB9D1C3019');
        $this->addSql('DROP INDEX IDX_3E7B0BFB9D1C3019 ON response');
        $this->addSql('ALTER TABLE response DROP participant_id');
    }
}
