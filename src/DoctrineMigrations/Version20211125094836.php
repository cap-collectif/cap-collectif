<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20211125094836 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'user_identification_code fields';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE user_identification_code ADD title VARCHAR(255) DEFAULT NULL, ADD firstname VARCHAR(255) DEFAULT NULL, ADD lastname VARCHAR(255) DEFAULT NULL, ADD address1 VARCHAR(255) DEFAULT NULL, ADD address2 VARCHAR(255) DEFAULT NULL, ADD address3 VARCHAR(255) DEFAULT NULL, ADD zip_code VARCHAR(255) DEFAULT NULL, ADD city VARCHAR(255) DEFAULT NULL, ADD country VARCHAR(255) DEFAULT NULL, ADD email VARCHAR(255) DEFAULT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE user_identification_code DROP title, DROP firstname, DROP lastname, DROP address1, DROP address2, DROP address3, DROP zip_code, DROP city, DROP country, DROP email'
        );
    }
}
