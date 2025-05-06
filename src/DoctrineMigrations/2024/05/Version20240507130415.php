<?php

declare(strict_types=1);

namespace Capco\DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20240507130415 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Remove orphaned analysis configurations associated with proposal forms that have no corresponding step.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('
            DELETE FROM analysis_configuration_process
            WHERE analysisConfiguration_id IN (
                SELECT proposal_form.analysis_configuration
                FROM proposal_form
                LEFT JOIN step ON proposal_form.step_id = step.id
                WHERE step.id IS NULL AND proposal_form.analysis_configuration IS NOT NULL
            );

            DELETE FROM analysis_configuration
            WHERE id IN (
                SELECT proposal_form.analysis_configuration
                FROM proposal_form
                LEFT JOIN step ON proposal_form.step_id = step.id
                WHERE step.id IS NULL AND proposal_form.analysis_configuration IS NOT NULL
            );
        ');
    }
}
