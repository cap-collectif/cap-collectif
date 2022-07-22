<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220719083351 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'sms votes';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE anonymous_user_proposal_sms_vote (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', proposal_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', selection_step_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', collect_step_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', phone VARCHAR(255) NOT NULL, status VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_9C8D43D2F4792058 (proposal_id), INDEX IDX_9C8D43D2DB15B87D (selection_step_id), INDEX IDX_9C8D43D2330C62D6 (collect_step_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE phone_token (phone VARCHAR(255) NOT NULL, token VARCHAR(255) NOT NULL, PRIMARY KEY(phone, token)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE anonymous_user_proposal_sms_vote ADD CONSTRAINT FK_9C8D43D2F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)');
        $this->addSql('ALTER TABLE anonymous_user_proposal_sms_vote ADD CONSTRAINT FK_9C8D43D2DB15B87D FOREIGN KEY (selection_step_id) REFERENCES step (id)');
        $this->addSql('ALTER TABLE anonymous_user_proposal_sms_vote ADD CONSTRAINT FK_9C8D43D2330C62D6 FOREIGN KEY (collect_step_id) REFERENCES step (id)');
        $this->addSql('ALTER TABLE step ADD is_proposal_sms_vote_enabled TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE votes ADD consent_sms_communication TINYINT(1) DEFAULT NULL, ADD phone VARCHAR(255) DEFAULT NULL');
        $this->addSql('CREATE UNIQUE INDEX selection_step_sms_vote_unique ON votes (phone, proposal_id, selection_step_id)');
        $this->addSql('CREATE UNIQUE INDEX collect_step_sms_vote_unique ON votes (phone, proposal_id, collect_step_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE anonymous_user_proposal_sms_vote');
        $this->addSql('DROP TABLE phone_token');
        $this->addSql('ALTER TABLE step DROP is_proposal_sms_vote_enabled');
        $this->addSql('DROP INDEX selection_step_sms_vote_unique ON votes');
        $this->addSql('DROP INDEX collect_step_sms_vote_unique ON votes');
        $this->addSql('ALTER TABLE votes DROP consent_sms_communication, DROP phone');
    }
}
