<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20171004163938 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE proposal_evaluation (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', proposal_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', questionnaire_id INT NOT NULL, INDEX IDX_61119603F4792058 (proposal_id), INDEX IDX_61119603CE07E8FF (questionnaire_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE proposal_evaluation ADD CONSTRAINT FK_61119603F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)');
        $this->addSql('ALTER TABLE proposal_evaluation ADD CONSTRAINT FK_61119603CE07E8FF FOREIGN KEY (questionnaire_id) REFERENCES questionnaire (id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE proposal_evaluation');
    }
}
