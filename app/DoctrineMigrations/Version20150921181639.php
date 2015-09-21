<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150921181639 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE step ADD opinions_display_nb INT DEFAULT NULL, ADD versions_display_nb INT DEFAULT NULL');
        $this->addSql('ALTER TABLE consultation ADD max_opinions INT DEFAULT NULL, ADD max_versions INT DEFAULT NULL');
        $this->addSql('ALTER TABLE opinion ADD ranking INT DEFAULT NULL');
        $this->addSql('ALTER TABLE opinion_version ADD ranking INT DEFAULT NULL');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE consultation DROP max_opinions, DROP max_versions');
        $this->addSql('ALTER TABLE opinion DROP ranking');
        $this->addSql('ALTER TABLE opinion_version DROP ranking');
        $this->addSql('ALTER TABLE step DROP opinions_display_nb, DROP versions_display_nb');
    }
}
