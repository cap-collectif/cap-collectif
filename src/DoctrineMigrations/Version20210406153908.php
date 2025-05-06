<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210406153908 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add a section_project table, It is used in the section admin where you can set which projects is rendered in the homepage, this table contains the associated projects to the section and the order';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE section_project (id INT AUTO_INCREMENT NOT NULL, section_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', project_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', position INT NOT NULL, INDEX IDX_FDF41DE1D823E37A (section_id), INDEX IDX_FDF41DE1166D1F9C (project_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE section_project ADD CONSTRAINT FK_FDF41DE1D823E37A FOREIGN KEY (section_id) REFERENCES section (id)'
        );
        $this->addSql(
            'ALTER TABLE section_project ADD CONSTRAINT FK_FDF41DE1166D1F9C FOREIGN KEY (project_id) REFERENCES project (id)'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE section_project');
    }
}
