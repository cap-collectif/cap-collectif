<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220117151013 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add body_using_jodit_wysiwyg to proposal';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE proposal ADD body_using_jodit_wysiwyg TINYINT(1) DEFAULT \'0\' NOT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE proposal DROP body_using_jodit_wysiwyg');
    }
}
