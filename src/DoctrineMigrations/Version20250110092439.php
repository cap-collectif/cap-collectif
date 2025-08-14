<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250110092439 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add is_created_before_workflow to votes and set it to true for existing votes';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE votes ADD is_created_before_workflow TINYINT(1) DEFAULT \'0\' NOT NULL');
        $this->addSql('UPDATE votes SET is_created_before_workflow = true');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE votes DROP is_created_before_workflow');
    }
}
