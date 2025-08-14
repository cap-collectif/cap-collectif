<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250609103915 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add votes participant unique constraint';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE UNIQUE INDEX selection_step_vote_unique_participant ON votes (participant_id, proposal_id, selection_step_id)');
        $this->addSql('CREATE UNIQUE INDEX collect_step_vote_unique_participant ON votes (participant_id, proposal_id, collect_step_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX selection_step_vote_unique_participant ON votes');
        $this->addSql('DROP INDEX collect_step_vote_unique_participant ON votes');
    }
}
