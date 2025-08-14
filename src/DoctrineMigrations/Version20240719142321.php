<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20240719142321 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add completion_status to votes';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE votes CHANGE completion_status completion_status VARCHAR(255) DEFAULT \'COMPLETED\' NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE votes CHANGE completion_status completion_status VARCHAR(255) CHARACTER SET utf8 DEFAULT \'COMPLETED\' COLLATE `utf8_unicode_ci`');
    }
}
