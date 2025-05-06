<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200312114517 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE event ADD admin_authorize_data_transfer TINYINT(1) NOT NULL, ADD author_agree_to_use_personal_data_for_event_only TINYINT(1) DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE event_registration ADD is_privacy_policy_accepted TINYINT(1) NOT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE event DROP admin_authorize_data_transfer, DROP author_agree_to_use_personal_data_for_event_only'
        );
        $this->addSql('ALTER TABLE event_registration DROP is_privacy_policy_accepted');
    }
}
