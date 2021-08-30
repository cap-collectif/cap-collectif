<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210827180600 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add notifications_configuration to questionnaire';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE notifications_configuration ADD on_questionnaire_reply_create TINYINT(1) DEFAULT \'0\', ADD on_questionnaire_reply_update TINYINT(1) DEFAULT \'0\', ADD on_questionnaire_reply_delete TINYINT(1) DEFAULT \'0\''
        );
        $this->addSql(
            'ALTER TABLE questionnaire ADD notification_configuration_id INT DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE questionnaire ADD CONSTRAINT FK_7A64DAFF9F76D25 FOREIGN KEY (notification_configuration_id) REFERENCES notifications_configuration (id)'
        );
        $this->addSql(
            'CREATE UNIQUE INDEX UNIQ_7A64DAFF9F76D25 ON questionnaire (notification_configuration_id)'
        );

        $this->addSql(
            'ALTER TABLE notifications_configuration ADD questionnaire_id VARCHAR(255) DEFAULT NULL '
        );

        $this->addSql("INSERT INTO notifications_configuration (on_questionnaire_reply_create, on_questionnaire_reply_update, on_questionnaire_reply_delete, entity, questionnaire_id)
                           SELECT notify_response_create, notify_response_update, notify_response_delete, 'questionnaire', id
                           FROM questionnaire");

        $this->addSql("UPDATE questionnaire
                           INNER JOIN notifications_configuration nc on nc.questionnaire_id = questionnaire.id
                           SET questionnaire.notification_configuration_id = nc.id
                           WHERE nc.entity = 'questionnaire'");

        $this->addSql(
            'ALTER TABLE questionnaire DROP notify_response_create, DROP notify_response_update, DROP notify_response_delete'
        );
        $this->addSql('ALTER TABLE notifications_configuration DROP questionnaire_id');

        $this->addSql(
            'ALTER TABLE questionnaire MODIFY COLUMN notification_configuration_id INT NOT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE notifications_configuration DROP on_questionnaire_reply_create, DROP on_questionnaire_reply_update, DROP on_questionnaire_reply_delete, DROP questionnaire_id'
        );
        $this->addSql('ALTER TABLE questionnaire DROP FOREIGN KEY FK_7A64DAFF9F76D25');
        $this->addSql('DROP INDEX UNIQ_7A64DAFF9F76D25 ON questionnaire');
        $this->addSql('ALTER TABLE questionnaire DROP notification_configuration_id');
    }
}
