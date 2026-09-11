<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260901110000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add the default map visibility to proposal steps';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE step ADD map_shown_by_default TINYINT(1) DEFAULT \'0\' NOT NULL');
        $this->addSql("UPDATE step INNER JOIN proposal_form ON step.proposal_form_id = proposal_form.id SET step.map_shown_by_default = 1 WHERE proposal_form.is_map_view_enabled = 1 AND step.main_view IN ('GRID', 'LIST')");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE step DROP map_shown_by_default');
    }
}
