<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170228113257 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE registration_form (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE questionnaire_abstractquestion ADD registration_form_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE questionnaire_abstractquestion ADD CONSTRAINT FK_3D2575641F87CEDB FOREIGN KEY (registration_form_id) REFERENCES registration_form (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_3D2575641F87CEDB ON questionnaire_abstractquestion (registration_form_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE questionnaire_abstractquestion DROP FOREIGN KEY FK_3D2575641F87CEDB');
        $this->addSql('DROP TABLE registration_form');
        $this->addSql('DROP INDEX IDX_3D2575641F87CEDB ON questionnaire_abstractquestion');
        $this->addSql('ALTER TABLE questionnaire_abstractquestion DROP registration_form_id');
    }
}
