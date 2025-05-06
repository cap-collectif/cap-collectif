<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20221025100901 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Organisation body nullable';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE organization_translation CHANGE body body LONGTEXT DEFAULT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE organization_translation CHANGE body body LONGTEXT CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`'
        );
    }
}
