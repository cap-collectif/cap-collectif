<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210802105814 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'remove everything related to synthesis_step';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE step DROP FOREIGN KEY FK_43B9FE3CEC91FE48');
        $this->addSql('DROP INDEX IDX_43B9FE3CEC91FE48 ON step');
        $this->addSql('ALTER TABLE step DROP synthesis_id');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE step ADD synthesis_id CHAR(36) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE step ADD CONSTRAINT FK_43B9FE3CEC91FE48 FOREIGN KEY (synthesis_id) REFERENCES synthesis (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_43B9FE3CEC91FE48 ON step (synthesis_id)');
    }
}
