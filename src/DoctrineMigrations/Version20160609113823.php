<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160609113823 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE votes ADD expired TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE argument ADD expired TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE comment ADD expired TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE idea ADD expired TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE opinion ADD expired TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE opinion_version ADD expired TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE proposal ADD expired TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE reply ADD expired TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE source ADD expired TINYINT(1) NOT NULL');
        $this->addSql('DROP INDEX idx_voter_confirmed ON votes');
        $this->addSql('ALTER TABLE votes DROP confirmed');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE argument DROP expired');
        $this->addSql('ALTER TABLE comment DROP expired');
        $this->addSql('ALTER TABLE idea DROP expired');
        $this->addSql('ALTER TABLE opinion DROP expired');
        $this->addSql('ALTER TABLE opinion_version DROP expired');
        $this->addSql('ALTER TABLE proposal DROP expired');
        $this->addSql('ALTER TABLE reply DROP expired');
        $this->addSql('ALTER TABLE source DROP expired');
        $this->addSql('ALTER TABLE votes DROP expired');
        $this->addSql('ALTER TABLE votes ADD confirmed TINYINT(1) NOT NULL');
        $this->addSql('CREATE INDEX idx_voter_confirmed ON votes (voter_id, confirmed)');
    }
}
