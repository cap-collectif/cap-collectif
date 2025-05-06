<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220420151609 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'remove_tipsmeee';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE proposal DROP tipsmeee_id');
        $this->addSql('ALTER TABLE proposal_form DROP using_tipsmeee, DROP tipsmeee_help_text');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE proposal ADD tipsmeee_id VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`'
        );
        $this->addSql(
            'ALTER TABLE proposal_form ADD using_tipsmeee TINYINT(1) DEFAULT \'0\' NOT NULL, ADD tipsmeee_help_text VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`'
        );
    }
}
