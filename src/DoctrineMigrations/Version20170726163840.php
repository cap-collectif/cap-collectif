<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170726163840 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void{
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE step DROP FOREIGN KEY FK_43B9FE3C9637EA18');
        $this->addSql('DROP INDEX IDX_43B9FE3C9637EA18 ON step');
        $this->addSql('ALTER TABLE step DROP consultation_step_type_id');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void{
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE step ADD consultation_step_type_id CHAR(36) DEFAULT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE step ADD CONSTRAINT FK_43B9FE3C9637EA18 FOREIGN KEY (consultation_step_type_id) REFERENCES consultation_step_type (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_43B9FE3C9637EA18 ON step (consultation_step_type_id)');
    }
}
