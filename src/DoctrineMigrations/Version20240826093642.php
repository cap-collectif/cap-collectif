<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20240826093642 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'remove unique sms votes and consent_sms_communication';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('DROP INDEX collect_step_sms_vote_unique ON votes');
        $this->addSql('DROP INDEX selection_step_sms_vote_unique ON votes');
        $this->addSql('ALTER TABLE votes DROP consent_sms_communication');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE votes ADD consent_sms_communication TINYINT(1) DEFAULT NULL');
        $this->addSql('CREATE UNIQUE INDEX collect_step_sms_vote_unique ON votes (phone, proposal_id, collect_step_id)');
        $this->addSql('CREATE UNIQUE INDEX selection_step_sms_vote_unique ON votes (phone, proposal_id, selection_step_id)');
    }
}
