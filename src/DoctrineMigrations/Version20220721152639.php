<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220721152639 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'argument.authorable';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE argument ADD organization_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE argument ADD CONSTRAINT FK_D113B0A32C8A3DE FOREIGN KEY (organization_id) REFERENCES organization (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_D113B0A32C8A3DE ON argument (organization_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE argument DROP FOREIGN KEY FK_D113B0A32C8A3DE');
        $this->addSql('DROP INDEX IDX_D113B0A32C8A3DE ON argument');
        $this->addSql('ALTER TABLE argument DROP organization_id');
    }
}
