<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220727180028 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'proposal_form.creator';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE proposal_form ADD creator_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE proposal_form ADD CONSTRAINT FK_72E9E83461220EA6 FOREIGN KEY (creator_id) REFERENCES fos_user (id)');
        $this->addSql('CREATE INDEX IDX_72E9E83461220EA6 ON proposal_form (creator_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE proposal_form DROP FOREIGN KEY FK_72E9E83461220EA6');
        $this->addSql('DROP INDEX IDX_72E9E83461220EA6 ON proposal_form');
        $this->addSql('ALTER TABLE proposal_form DROP creator_id');
    }

    public function postUp(Schema $schema): void
    {
        $this->connection->executeQuery(
            'UPDATE proposal_form set creator_id = owner_id WHERE creator_id IS NULL AND owner_id IS NOT NULL'
        );
    }
}
