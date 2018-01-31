<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180131181637 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE UNIQUE INDEX opinion_vote_unique ON votes (voter_id, opinion_id)');
        $this->addSql('CREATE UNIQUE INDEX argument_vote_unique ON votes (voter_id, argument_id)');
        $this->addSql('CREATE UNIQUE INDEX opinion_version_vote_unique ON votes (voter_id, opinion_version_id)');
        $this->addSql('CREATE UNIQUE INDEX selection_step_vote_unique ON votes (voter_id, selection_step_id)');
        $this->addSql('CREATE UNIQUE INDEX collect_step_vote_unique ON votes (voter_id, collect_step_id)');
        $this->addSql('CREATE UNIQUE INDEX source_vote_unique ON votes (voter_id, source_id)');
        $this->addSql('CREATE UNIQUE INDEX comment_vote_unique ON votes (voter_id, comment_id)');
        $this->addSql('CREATE UNIQUE INDEX idea_vote_unique ON votes (voter_id, idea_id)');
        $this->addSql('DROP INDEX UNIQ_AB02B027AC6D46AF ON opinion');
        $this->addSql('ALTER TABLE opinion DROP moderation_token');
        $this->addSql('DROP INDEX UNIQ_52AD19DDAC6D46AF ON opinion_version');
        $this->addSql('ALTER TABLE opinion_version DROP moderation_token');
        $this->addSql('DROP INDEX UNIQ_D113B0AAC6D46AF ON argument');
        $this->addSql('ALTER TABLE argument DROP moderation_token');
        $this->addSql('ALTER TABLE step DROP moderating_on_create, DROP moderating_on_update');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE argument ADD moderation_token VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_D113B0AAC6D46AF ON argument (moderation_token)');
        $this->addSql('ALTER TABLE opinion ADD moderation_token VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_AB02B027AC6D46AF ON opinion (moderation_token)');
        $this->addSql('ALTER TABLE opinion_version ADD moderation_token VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_52AD19DDAC6D46AF ON opinion_version (moderation_token)');
        $this->addSql('ALTER TABLE step ADD moderating_on_create TINYINT(1) DEFAULT \'0\', ADD moderating_on_update TINYINT(1) DEFAULT \'0\'');
        $this->addSql('DROP INDEX opinion_vote_unique ON votes');
        $this->addSql('DROP INDEX argument_vote_unique ON votes');
        $this->addSql('DROP INDEX opinion_version_vote_unique ON votes');
        $this->addSql('DROP INDEX selection_step_vote_unique ON votes');
        $this->addSql('DROP INDEX collect_step_vote_unique ON votes');
        $this->addSql('DROP INDEX source_vote_unique ON votes');
        $this->addSql('DROP INDEX comment_vote_unique ON votes');
        $this->addSql('DROP INDEX idea_vote_unique ON votes');
    }
}
