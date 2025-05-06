<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220328103012 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add fields `measurable` and `max_registrations` on event';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE event ADD measurable TINYINT(1) DEFAULT \'0\' NOT NULL, ADD max_registrations INT DEFAULT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE event DROP measurable, DROP max_registrations');
    }
}
