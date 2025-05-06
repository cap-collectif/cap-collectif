<?php

declare(strict_types=1);

namespace Capco\DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20240126084116 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'update questionnaire type linked to analysis configuration';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('UPDATE questionnaire q JOIN analysis_configuration a ON a.evaluationForm_id = q.id SET q.type = \'QUESTIONNAIRE_ANALYSIS\'');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('UPDATE questionnaire q JOIN analysis_configuration a ON a.evaluationForm_id = q.id SET q.type = \'QUESTIONNAIRE\'');
    }
}
