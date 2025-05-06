<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20240116082626 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add event_district_positioner';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE event_district_positioner (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', district_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', event_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', position INT NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_B5192D93B08FA272 (district_id), INDEX IDX_B5192D9371F7E88B (event_id), UNIQUE INDEX event_district_position_unique (event_id, district_id, position), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE event_district_positioner ADD CONSTRAINT FK_B5192D93B08FA272 FOREIGN KEY (district_id) REFERENCES district (id)');
        $this->addSql('ALTER TABLE event_district_positioner ADD CONSTRAINT FK_B5192D9371F7E88B FOREIGN KEY (event_id) REFERENCES event (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE event_district_positioner');
    }
}
