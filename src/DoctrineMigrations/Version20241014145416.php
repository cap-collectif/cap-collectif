<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20241014145416 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add section_carrousel_element table & type field to section table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE section_carrousel_element (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', section_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', image_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', title VARCHAR(255) NOT NULL, position INT NOT NULL, description VARCHAR(255) DEFAULT NULL, buttonLabel VARCHAR(255) NOT NULL, redirectLink VARCHAR(255) NOT NULL, isDisplayed TINYINT(1) NOT NULL, type VARCHAR(255) NOT NULL, INDEX IDX_53FC8B2AD823E37A (section_id), INDEX IDX_53FC8B2A3DA5256D (image_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE section_carrousel_element ADD CONSTRAINT FK_53FC8B2AD823E37A FOREIGN KEY (section_id) REFERENCES section (id)');
        $this->addSql('ALTER TABLE section_carrousel_element ADD CONSTRAINT FK_53FC8B2A3DA5256D FOREIGN KEY (image_id) REFERENCES media__media (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE section ADD is_legend_enabled_on_image TINYINT(1) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE section_carrousel_element');
        $this->addSql('ALTER TABLE section DROP is_legend_enabled_on_image');
    }
}
