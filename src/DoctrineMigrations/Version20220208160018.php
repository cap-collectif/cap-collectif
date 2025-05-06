<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220208160018 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE event DROP FOREIGN KEY FK_3BAE0AA770FBD26D');
        $this->addSql('DROP INDEX IDX_3BAE0AA770FBD26D ON event');
        $this->addSql(
            'ALTER TABLE event DROP animator_id, DROP jitsi_token, DROP is_presential, DROP recording_link, DROP is_recording_published'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE event ADD animator_id CHAR(36) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\', ADD jitsi_token LONGTEXT CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD is_presential TINYINT(1) DEFAULT \'1\' NOT NULL, ADD recording_link LONGTEXT CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD is_recording_published TINYINT(1) DEFAULT \'0\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE event ADD CONSTRAINT FK_3BAE0AA770FBD26D FOREIGN KEY (animator_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_3BAE0AA770FBD26D ON event (animator_id)');
    }
}
