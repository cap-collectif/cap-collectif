<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200309100114 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'localize project';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE project ADD locale CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE project ADD CONSTRAINT FK_2FB3D0EE4180C698 FOREIGN KEY (locale) REFERENCES locale (id)'
        );
        $this->addSql('CREATE INDEX IDX_2FB3D0EE4180C698 ON project (locale)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE project DROP FOREIGN KEY FK_2FB3D0EE4180C698');
        $this->addSql('DROP INDEX IDX_2FB3D0EE4180C698 ON project');
        $this->addSql('ALTER TABLE project DROP locale');
    }
}
