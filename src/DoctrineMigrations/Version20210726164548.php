<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210726164548 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'proposal_form.owner_id';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE proposal_form ADD owner_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE proposal_form ADD CONSTRAINT FK_72E9E8347E3C61F9 FOREIGN KEY (owner_id) REFERENCES fos_user (id)'
        );
        $this->addSql('CREATE INDEX IDX_72E9E8347E3C61F9 ON proposal_form (owner_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE proposal_form DROP FOREIGN KEY FK_72E9E8347E3C61F9');
        $this->addSql('DROP INDEX IDX_72E9E8347E3C61F9 ON proposal_form');
        $this->addSql('ALTER TABLE proposal_form DROP owner_id');
    }
}
