<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220117134919 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add footer_using_jodit_wysiwyg to step';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE step ADD footer_using_jodit_wysiwyg TINYINT(1) DEFAULT \'0\'');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE step DROP footer_using_jodit_wysiwyg');
    }
}
