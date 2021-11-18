<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20211117141551 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'user_identification_code_list 2';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE user_identification_code CHANGE list_id list_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\''
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE user_identification_code CHANGE list_id list_id CHAR(36) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\''
        );
    }
}
