<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160614152608 extends AbstractMigration
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
            'CREATE TABLE proposal_category (id INT AUTO_INCREMENT NOT NULL, form_id INT NOT NULL, name VARCHAR(100) NOT NULL, updated_at DATETIME NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_E71725E95FF69B7D (form_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE proposal_category ADD CONSTRAINT FK_E71725E95FF69B7D FOREIGN KEY (form_id) REFERENCES proposal_form (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE proposal ADD category_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE proposal ADD CONSTRAINT FK_BFE5947212469DE2 FOREIGN KEY (category_id) REFERENCES proposal_category (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_BFE5947212469DE2 ON proposal (category_id)');
        $this->addSql(
            'ALTER TABLE proposal_form ADD category_help_text VARCHAR(255) DEFAULT NULL, ADD using_themes TINYINT(1) NOT NULL, ADD theme_mandatory TINYINT(1) NOT NULL, ADD using_categories TINYINT(1) NOT NULL, ADD category_mandatory TINYINT(1) NOT NULL'
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

        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE5947212469DE2');
        $this->addSql('DROP TABLE proposal_category');
        $this->addSql('DROP INDEX IDX_BFE5947212469DE2 ON proposal');
        $this->addSql('ALTER TABLE proposal DROP category_id');
        $this->addSql(
            'ALTER TABLE proposal_form DROP category_help_text, DROP using_themes, DROP theme_mandatory, DROP using_categories, DROP category_mandatory'
        );
    }
}
