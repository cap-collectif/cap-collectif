<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20180312125200 extends AbstractMigration
{
    public function up(Schema $schema): void{
        $this->addSql(
            'CREATE UNIQUE INDEX questionnaire_position_unique ON questionnaire_abstractquestion (questionnaire_id, position)'
        );
        $this->addSql(
            'ALTER TABLE proposal_form DROP INDEX IDX_72E9E8347CE583F7, ADD UNIQUE INDEX UNIQ_72E9E8347CE583F7 (evaluation_form_id)'
        );
    }

    public function down(Schema $schema): void{
        $this->addSql(
            'ALTER TABLE proposal_form DROP INDEX UNIQ_72E9E8347CE583F7, ADD INDEX IDX_72E9E8347CE583F7 (evaluation_form_id)'
        );
        $this->addSql('DROP INDEX questionnaire_position_unique ON questionnaire_abstractquestion');
        $this->addSql(
            'CREATE UNIQUE INDEX questionnaire_position_unique ON questionnaire_abstractquestion (position)'
        );
    }
}
