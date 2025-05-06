<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20241025140013 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Reduce length of title, description and buttonLabel fields in section_carrousel_element table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE section_carrousel_element CHANGE title title VARCHAR(50) NOT NULL, CHANGE description description VARCHAR(165) DEFAULT NULL, CHANGE buttonLabel buttonLabel VARCHAR(20) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE section_carrousel_element CHANGE title title VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, CHANGE description description VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, CHANGE buttonLabel buttonLabel VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`');
    }
}
