<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20221025141732 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add moderation_status to comment table';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE comment ADD moderation_status VARCHAR(255) DEFAULT \'PENDING\' NOT NULL');
        $this->addSql("UPDATE comment SET moderation_status = 'APPROVED'");
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE comment DROP moderation_status');
    }
}
