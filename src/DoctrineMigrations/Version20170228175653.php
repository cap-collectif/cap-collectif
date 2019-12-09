<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170228175653 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE registration_form (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE response ADD user_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE response ADD CONSTRAINT FK_3E7B0BFBA76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_3E7B0BFBA76ED395 ON response (user_id)');
        $this->addSql(
            'ALTER TABLE questionnaire_abstractquestion ADD registration_form_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE questionnaire_abstractquestion ADD CONSTRAINT FK_3D2575641F87CEDB FOREIGN KEY (registration_form_id) REFERENCES registration_form (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'CREATE INDEX IDX_3D2575641F87CEDB ON questionnaire_abstractquestion (registration_form_id)'
        );
    }

    public function postUp(Schema $schema): void
    {
        $this->connection->insert('registration_form', []);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE questionnaire_abstractquestion DROP FOREIGN KEY FK_3D2575641F87CEDB'
        );
        $this->addSql('DROP TABLE registration_form');
        $this->addSql('DROP INDEX IDX_3D2575641F87CEDB ON questionnaire_abstractquestion');
        $this->addSql('ALTER TABLE questionnaire_abstractquestion DROP registration_form_id');
        $this->addSql('ALTER TABLE response DROP FOREIGN KEY FK_3E7B0BFBA76ED395');
        $this->addSql('DROP INDEX IDX_3E7B0BFBA76ED395 ON response');
        $this->addSql('ALTER TABLE response DROP user_id');
    }
}
