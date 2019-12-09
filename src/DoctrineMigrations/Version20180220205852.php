<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180220205852 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE UNIQUE INDEX questionnaire_position_unique ON questionnaire_abstractquestion (questionnaire_id, position)'
        );
        $this->addSql(
            'CREATE UNIQUE INDEX proposal_form_position_unique ON questionnaire_abstractquestion (proposal_form_id, position)'
        );
        $this->addSql(
            'CREATE UNIQUE INDEX registration_form_position_unique ON questionnaire_abstractquestion (registration_form_id, position)'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP INDEX questionnaire_position_unique ON questionnaire_abstractquestion');
        $this->addSql('DROP INDEX proposal_form_position_unique ON questionnaire_abstractquestion');
        $this->addSql(
            'DROP INDEX registration_form_position_unique ON questionnaire_abstractquestion'
        );
    }
}
