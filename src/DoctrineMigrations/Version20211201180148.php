<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20211201180148 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Move mailjet_id, mandrill_id, internal_status to UserInviteEmailMessage entity.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE user_invite DROP internal_status, DROP mailjet_id, DROP mandrill_id'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE user_invite ADD internal_status VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, ADD mailjet_id VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD mandrill_id VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`'
        );
    }
}
