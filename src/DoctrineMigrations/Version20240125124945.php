<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20240125124945 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'update questionnaire type linked to analysis form';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('UPDATE questionnaire q JOIN proposal_form p ON p.evaluation_form_id = q.id set q.type = \'QUESTIONNAIRE_ANALYSIS\'');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('UPDATE questionnaire q JOIN proposal_form p ON p.evaluation_form_id = q.id set q.type = \'QUESTIONNAIRE\'');
    }
}
