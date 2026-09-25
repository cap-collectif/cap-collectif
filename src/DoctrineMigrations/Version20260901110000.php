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
        if (!$schema->getTable('step')->hasColumn('map_shown_by_default')) {
            $this->addSql('ALTER TABLE step ADD map_shown_by_default TINYINT(1) DEFAULT \'0\' NOT NULL');
        }
        $this->addSql("UPDATE step INNER JOIN proposal_form ON proposal_form.step_id = step.id SET step.map_shown_by_default = 1 WHERE proposal_form.map_view_enabled = 1 AND step.main_view IN ('GRID', 'LIST')");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE step DROP map_shown_by_default');
    }
}
