<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151019110003 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE opinion ADD link_id INT DEFAULT NULL, ADD connections_count INT NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE opinion ADD CONSTRAINT FK_AB02B027ADA40271 FOREIGN KEY (link_id) REFERENCES opinion (id)'
        );
        $this->addSql('CREATE INDEX IDX_AB02B027ADA40271 ON opinion (link_id)');
        $this->addSql('ALTER TABLE opinion_type ADD linkable TINYINT(1) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE opinion DROP FOREIGN KEY FK_AB02B027ADA40271');
        $this->addSql('DROP INDEX IDX_AB02B027ADA40271 ON opinion');
        $this->addSql('ALTER TABLE opinion DROP link_id, DROP connections_count');
        $this->addSql('ALTER TABLE opinion_type DROP linkable');
    }
}
