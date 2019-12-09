<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150827152027 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE appendix_type (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE opinion_appendices (id INT AUTO_INCREMENT NOT NULL, appendix_type_id INT NOT NULL, opinion_id INT NOT NULL, body LONGTEXT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, INDEX IDX_406CC94517BCF1BB (appendix_type_id), INDEX IDX_406CC94551885A6A (opinion_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE opinion_type_appendix_type (id INT AUTO_INCREMENT NOT NULL, opinion_type_id INT NOT NULL, appendix_type_id INT NOT NULL, position INT NOT NULL, INDEX IDX_BB0BD95628FD468D (opinion_type_id), INDEX IDX_BB0BD95617BCF1BB (appendix_type_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE opinion_appendices ADD CONSTRAINT FK_406CC94517BCF1BB FOREIGN KEY (appendix_type_id) REFERENCES appendix_type (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE opinion_appendices ADD CONSTRAINT FK_406CC94551885A6A FOREIGN KEY (opinion_id) REFERENCES opinion (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE opinion_type_appendix_type ADD CONSTRAINT FK_BB0BD95628FD468D FOREIGN KEY (opinion_type_id) REFERENCES opinion_type (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE opinion_type_appendix_type ADD CONSTRAINT FK_BB0BD95617BCF1BB FOREIGN KEY (appendix_type_id) REFERENCES appendix_type (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE opinion_appendices DROP FOREIGN KEY FK_406CC94517BCF1BB');
        $this->addSql(
            'ALTER TABLE opinion_type_appendix_type DROP FOREIGN KEY FK_BB0BD95617BCF1BB'
        );
        $this->addSql('DROP TABLE appendix_type');
        $this->addSql('DROP TABLE opinion_appendices');
        $this->addSql('DROP TABLE opinion_type_appendix_type');
    }
}
