<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160930182114 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE responses_medias (response_id INT NOT NULL, media_id INT NOT NULL, INDEX IDX_EE827965FBF32840 (response_id), INDEX IDX_EE827965EA9FDD75 (media_id), PRIMARY KEY(response_id, media_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE responses_medias ADD CONSTRAINT FK_EE827965FBF32840 FOREIGN KEY (response_id) REFERENCES response (id)'
        );
        $this->addSql(
            'ALTER TABLE responses_medias ADD CONSTRAINT FK_EE827965EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id)'
        );
        $this->addSql('ALTER TABLE proposal ADD media_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE proposal ADD CONSTRAINT FK_BFE59472EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE UNIQUE INDEX UNIQ_BFE59472EA9FDD75 ON proposal (media_id)');
        $this->addSql('ALTER TABLE response ADD response_type VARCHAR(255) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE responses_medias');
        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE59472EA9FDD75');
        $this->addSql('DROP INDEX UNIQ_BFE59472EA9FDD75 ON proposal');
        $this->addSql('ALTER TABLE proposal DROP media_id');
        $this->addSql('ALTER TABLE response DROP response_type');
    }
}
