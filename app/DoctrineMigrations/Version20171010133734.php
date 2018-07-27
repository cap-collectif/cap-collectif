<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20171010133734 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE proposal DROP INDEX IDX_BFE59472EA9FDD75, ADD UNIQUE INDEX UNIQ_BFE59472EA9FDD75 (media_id)'
        );
        $this->addSql(
            'ALTER TABLE theme DROP INDEX IDX_9775E708EA9FDD75, ADD UNIQUE INDEX UNIQ_9775E708EA9FDD75 (media_id)'
        );
        $this->addSql(
            'ALTER TABLE idea DROP INDEX IDX_A8BCA45EA9FDD75, ADD UNIQUE INDEX UNIQ_A8BCA45EA9FDD75 (media_id)'
        );
        $this->addSql(
            'ALTER TABLE source DROP INDEX IDX_5F8A7F73EA9FDD75, ADD UNIQUE INDEX UNIQ_5F8A7F73EA9FDD75 (media_id)'
        );
        $this->addSql(
            'ALTER TABLE page DROP INDEX IDX_140AB620EA9FDD75, ADD UNIQUE INDEX UNIQ_140AB620EA9FDD75 (media_id)'
        );
        $this->addSql(
            'ALTER TABLE event DROP INDEX IDX_3BAE0AA7EA9FDD75, ADD UNIQUE INDEX UNIQ_3BAE0AA7EA9FDD75 (media_id)'
        );
        $this->addSql(
            'ALTER TABLE video DROP INDEX IDX_7CC7DA2CEA9FDD75, ADD UNIQUE INDEX UNIQ_7CC7DA2CEA9FDD75 (media_id)'
        );
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE event DROP INDEX UNIQ_3BAE0AA7EA9FDD75, ADD INDEX IDX_3BAE0AA7EA9FDD75 (media_id)'
        );
        $this->addSql(
            'ALTER TABLE idea DROP INDEX UNIQ_A8BCA45EA9FDD75, ADD INDEX IDX_A8BCA45EA9FDD75 (media_id)'
        );
        $this->addSql(
            'ALTER TABLE page DROP INDEX UNIQ_140AB620EA9FDD75, ADD INDEX IDX_140AB620EA9FDD75 (media_id)'
        );
        $this->addSql(
            'ALTER TABLE proposal DROP INDEX UNIQ_BFE59472EA9FDD75, ADD INDEX IDX_BFE59472EA9FDD75 (media_id)'
        );
        $this->addSql(
            'ALTER TABLE source DROP INDEX UNIQ_5F8A7F73EA9FDD75, ADD INDEX IDX_5F8A7F73EA9FDD75 (media_id)'
        );
        $this->addSql(
            'ALTER TABLE theme DROP INDEX UNIQ_9775E708EA9FDD75, ADD INDEX IDX_9775E708EA9FDD75 (media_id)'
        );
        $this->addSql(
            'ALTER TABLE video DROP INDEX UNIQ_7CC7DA2CEA9FDD75, ADD INDEX IDX_7CC7DA2CEA9FDD75 (media_id)'
        );
    }
}
