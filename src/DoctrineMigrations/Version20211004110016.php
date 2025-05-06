<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20211004110016 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add internal_status, mailjet_id, mandrill_id.';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE user_invite ADD `mailjet_id` VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD `mandrill_id` VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD `internal_status` VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE user_invite DROP `mailjet_id`, DROP `mandrill_id`, DROP `internal_status`'
        );
    }
}
