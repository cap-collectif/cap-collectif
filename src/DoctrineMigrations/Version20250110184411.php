<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250110184411 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Increase title and description length in section carrousel element';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE section_carrousel_element CHANGE title title VARCHAR(55) NOT NULL, CHANGE description description VARCHAR(220) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE section_carrousel_element CHANGE title title VARCHAR(50) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, CHANGE description description VARCHAR(165) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`');
    }
}
