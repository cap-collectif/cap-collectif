<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180312125200 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP INDEX questionnaire_position_unique ON questionnaire_abstractquestion');
        $this->addSql('CREATE UNIQUE INDEX questionnaire_position_unique ON questionnaire_abstractquestion (questionnaire_id, position)');
        $this->addSql('ALTER TABLE proposal_form DROP INDEX IDX_72E9E8347CE583F7, ADD UNIQUE INDEX UNIQ_72E9E8347CE583F7 (evaluation_form_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE proposal_form DROP INDEX UNIQ_72E9E8347CE583F7, ADD INDEX IDX_72E9E8347CE583F7 (evaluation_form_id)');
        $this->addSql('DROP INDEX questionnaire_position_unique ON questionnaire_abstractquestion');
        $this->addSql('CREATE UNIQUE INDEX questionnaire_position_unique ON questionnaire_abstractquestion (position)');
    }
}
