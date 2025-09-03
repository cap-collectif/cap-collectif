<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250818134922 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Move startAt and endAt from extra_data JSON to dedicated columns';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE section_carrousel_element ADD start_at DATETIME DEFAULT NULL, ADD end_at DATETIME DEFAULT NULL');

        $this->addSql(
            "UPDATE section_carrousel_element
            SET start_at = STR_TO_DATE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(extra_data, '$.startAt')), 'null'), '%Y-%m-%d %H:%i:%s'),
            end_at   = STR_TO_DATE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(extra_data, '$.endAt')), 'null'), '%Y-%m-%d %H:%i:%s')
            WHERE extra_data IS NOT NULL"
        );

        $this->addSql('ALTER TABLE section_carrousel_element DROP extra_data');
    }

    public function down(Schema $schema): void
    {
        $this->addSql("ALTER TABLE section_carrousel_element
            ADD extra_data LONGTEXT CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci` COMMENT '(DC2Type:json)'");

        $this->addSql("UPDATE section_carrousel_element
            SET extra_data = CASE
                WHEN start_at IS NULL AND end_at IS NULL THEN NULL
                ELSE JSON_OBJECT(
                    'startAt', DATE_FORMAT(start_at, '%Y-%m-%d %H:%i:%s'),
                    'endAt',   DATE_FORMAT(end_at, '%Y-%m-%d %H:%i:%s')
                )
            END");

        $this->addSql('ALTER TABLE section_carrousel_element DROP start_at, DROP end_at');
    }
}
