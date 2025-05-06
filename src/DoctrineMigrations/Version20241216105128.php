<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20241216105128 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add extra_data json field to section_carrousel_element & rename columns from section_carrousel_element to snake_case';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE section_carrousel_element ADD extra_data LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:json)\'');
        $this->addSql('ALTER TABLE section_carrousel_element CHANGE buttonlabel button_label VARCHAR(20) NOT NULL, CHANGE redirectlink redirect_link VARCHAR(255) NOT NULL, CHANGE isdisplayed is_displayed TINYINT(1) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE section_carrousel_element DROP extra_data');
        $this->addSql('ALTER TABLE section_carrousel_element CHANGE button_label buttonLabel VARCHAR(20) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, CHANGE redirect_link redirectLink VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, CHANGE is_displayed isDisplayed TINYINT(1) NOT NULL');
    }
}
