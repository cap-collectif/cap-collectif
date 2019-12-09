<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150928140051 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE comment ADD validated TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE argument ADD validated TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE idea ADD validated TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE opinion ADD validated TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE opinion_version ADD validated TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE source ADD validated TINYINT(1) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE argument DROP validated');
        $this->addSql('ALTER TABLE comment DROP validated');
        $this->addSql('ALTER TABLE idea DROP validated');
        $this->addSql('ALTER TABLE opinion DROP validated');
        $this->addSql('ALTER TABLE opinion_version DROP validated');
        $this->addSql('ALTER TABLE source DROP validated');
    }
}
