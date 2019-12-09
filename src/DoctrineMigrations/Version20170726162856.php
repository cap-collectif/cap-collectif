<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170726162856 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE consultation_step_type ADD step_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE consultation_step_type ADD CONSTRAINT FK_64BADC9F73B21E9C FOREIGN KEY (step_id) REFERENCES step (id)'
        );
        $this->addSql(
            'CREATE UNIQUE INDEX UNIQ_64BADC9F73B21E9C ON consultation_step_type (step_id)'
        );
    }

    public function postUp(Schema $schema): void
    {
        $steps = $this->connection->fetchAll('SELECT * FROM step');
        foreach ($steps as $step) {
            if (null != $step['consultation_step_type_id']) {
                $this->connection->update(
                    'consultation_step_type',
                    ['step_id' => $step['id']],
                    ['id' => $step['consultation_step_type_id']]
                );
            }
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE consultation_step_type DROP FOREIGN KEY FK_64BADC9F73B21E9C');
        $this->addSql('DROP INDEX UNIQ_64BADC9F73B21E9C ON consultation_step_type');
        $this->addSql('ALTER TABLE consultation_step_type DROP step_id');
    }
}
