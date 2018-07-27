<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170405151520 extends AbstractMigration
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
            'CREATE TABLE email_domain (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', registration_form_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', value VARCHAR(255) NOT NULL, INDEX IDX_DA33CDFB1F87CEDB (registration_form_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE email_domain ADD CONSTRAINT FK_DA33CDFB1F87CEDB FOREIGN KEY (registration_form_id) REFERENCES registration_form (id) ON DELETE CASCADE'
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

        $this->addSql('DROP TABLE email_domain');
    }
}
