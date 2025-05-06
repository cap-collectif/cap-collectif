<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231128143446 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'extend temporaryID length';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE question_choice CHANGE temporary_id temporary_id VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE question_choice CHANGE temporary_id temporary_id CHAR(36) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\'');
    }
}
