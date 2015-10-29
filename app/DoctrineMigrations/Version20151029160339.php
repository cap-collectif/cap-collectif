<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151029160339 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE argument CHANGE vote_count votes_count INT NOT NULL');
        $this->addSql('ALTER TABLE comment CHANGE vote_count votes_count INT NOT NULL');
        $this->addSql('ALTER TABLE idea CHANGE vote_count votes_count INT NOT NULL');
        $this->addSql('ALTER TABLE proposal CHANGE vote_count_ok votes_count INT NOT NULL');
        $this->addSql('ALTER TABLE source CHANGE vote_count_source votes_count INT NOT NULL');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE argument CHANGE votes_count vote_count INT NOT NULL');
        $this->addSql('ALTER TABLE comment CHANGE votes_count vote_count INT NOT NULL');
        $this->addSql('ALTER TABLE idea CHANGE votes_count vote_count INT NOT NULL');
        $this->addSql('ALTER TABLE proposal CHANGE votes_count vote_count_ok INT NOT NULL');
        $this->addSql('ALTER TABLE source CHANGE votes_count vote_count_source INT NOT NULL');
    }
}
