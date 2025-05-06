<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200724134315 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add remote events feature.';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE event_step (event_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', abstractstep_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', INDEX IDX_5C72B29771F7E88B (event_id), INDEX IDX_5C72B2975A961B3C (abstractstep_id), PRIMARY KEY(event_id, abstractstep_id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE event_step ADD CONSTRAINT FK_5C72B29771F7E88B FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE event_step ADD CONSTRAINT FK_5C72B2975A961B3C FOREIGN KEY (abstractstep_id) REFERENCES step (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE event ADD animator_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', ADD room_name LONGTEXT DEFAULT NULL, ADD jitsi_token LONGTEXT DEFAULT NULL, ADD is_presential TINYINT(1) DEFAULT \'1\' NOT NULL, ADD recording_link LONGTEXT DEFAULT NULL, ADD is_recording_published TINYINT(1) DEFAULT \'0\' NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE event ADD CONSTRAINT FK_3BAE0AA770FBD26D FOREIGN KEY (animator_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_3BAE0AA770FBD26D ON event (animator_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE event_step');
        $this->addSql('ALTER TABLE event DROP FOREIGN KEY FK_3BAE0AA770FBD26D');
        $this->addSql('DROP INDEX IDX_3BAE0AA770FBD26D ON event');
        $this->addSql(
            'ALTER TABLE event DROP animator_id, DROP room_name, DROP jitsi_token, DROP is_presential, DROP recording_link, DROP is_recording_published'
        );
    }
}
