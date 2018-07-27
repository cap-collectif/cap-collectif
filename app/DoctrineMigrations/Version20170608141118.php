<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20170608141118 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE proposal_form DROP INDEX IDX_72E9E83473B21E9C, ADD UNIQUE INDEX UNIQ_72E9E83473B21E9C (step_id)'
        );
        $this->addSql(
            'ALTER TABLE project_abstractstep DROP INDEX IDX_79774AB773B21E9C, ADD UNIQUE INDEX UNIQ_79774AB773B21E9C (step_id)'
        );
        $this->addSql(
            'ALTER TABLE questionnaire DROP INDEX IDX_7A64DAF73B21E9C, ADD UNIQUE INDEX UNIQ_7A64DAF73B21E9C (step_id)'
        );
    }

    public function down(Schema $schema)
    {
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE project_abstractstep DROP INDEX UNIQ_79774AB773B21E9C, ADD INDEX IDX_79774AB773B21E9C (step_id)'
        );
        $this->addSql(
            'ALTER TABLE proposal_form DROP INDEX UNIQ_72E9E83473B21E9C, ADD INDEX IDX_72E9E83473B21E9C (step_id)'
        );
        $this->addSql(
            'ALTER TABLE questionnaire DROP INDEX UNIQ_7A64DAF73B21E9C, ADD INDEX IDX_7A64DAF73B21E9C (step_id)'
        );
    }
}
