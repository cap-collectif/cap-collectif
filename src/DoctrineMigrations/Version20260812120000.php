<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260812120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Store the latest proposal reference per proposal form for atomic allocation';
    }

    public function up(Schema $schema): void
    {
        $proposalFormTable = $schema->getTable('proposal_form');
        if (!$proposalFormTable->hasColumn('last_proposal_reference')) {
            $this->addSql('ALTER TABLE proposal_form ADD last_proposal_reference INT NOT NULL DEFAULT 0');
        }

        $this->addSql('LOCK TABLES proposal_form AS pf WRITE, proposal READ');
        $this->addSql(<<<'SQL'
            UPDATE proposal_form pf
            LEFT JOIN (
                SELECT proposal_form_id, MAX(reference) AS last_proposal_reference
                FROM proposal
                GROUP BY proposal_form_id
            ) p ON p.proposal_form_id = pf.id
            SET pf.last_proposal_reference = COALESCE(p.last_proposal_reference, 0)
            SQL);
        $this->addSql('UNLOCK TABLES');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE proposal_form DROP last_proposal_reference');
    }
}
