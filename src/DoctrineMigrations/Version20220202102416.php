<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220202102416 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'proposal_step_paper_vote_counter';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE proposal_step_paper_vote_counter (proposal_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', step_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', totalCount INT NOT NULL, totalPointsCount INT NOT NULL, INDEX IDX_F5D42B82F4792058 (proposal_id), INDEX IDX_F5D42B8273B21E9C (step_id), UNIQUE INDEX UNIQ_F5D42B8273B21E9CF4792058 (step_id, proposal_id), PRIMARY KEY(proposal_id, step_id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE proposal_step_paper_vote_counter ADD CONSTRAINT FK_F5D42B82F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)');
        $this->addSql('ALTER TABLE proposal_step_paper_vote_counter ADD CONSTRAINT FK_F5D42B8273B21E9C FOREIGN KEY (step_id) REFERENCES step (id)');
        $this->addSql('ALTER TABLE proposal DROP paper_votes_count');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE proposal_step_paper_vote_counter');
        $this->addSql('ALTER TABLE proposal ADD paper_votes_count INT NOT NULL');
    }
}
