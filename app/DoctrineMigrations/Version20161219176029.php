<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20161219176029 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        // $this->addSql('ALTER TABLE proposal CHANGE update_author_id update_author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', CHANGE author_id author_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE user_favorite_proposal CHANGE user_id user_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE theme CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE comment CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE reporting CHANGE reporter_id reporter_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE votes CHANGE voter_id voter_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE answer CHANGE author_id author_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE opinion CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE opinion_version CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE idea CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE argument CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE source CHANGE author_id author_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE reply CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE project CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE event CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE blog_post_authors CHANGE user_id user_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE event_registration CHANGE user_id user_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE synthesis_element CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE video CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE fos_user CHANGE id id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE fos_user_user_group CHANGE user_id user_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\'');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE answer CHANGE author_id author_id INT NOT NULL');
        $this->addSql('ALTER TABLE argument CHANGE author_id author_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE blog_post_authors CHANGE user_id user_id INT NOT NULL');
        $this->addSql('ALTER TABLE comment CHANGE author_id author_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE event CHANGE author_id author_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE event_registration CHANGE user_id user_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE fos_user CHANGE id id INT AUTO_INCREMENT NOT NULL');
        $this->addSql('ALTER TABLE fos_user_user_group CHANGE user_id user_id INT NOT NULL');
        $this->addSql('ALTER TABLE idea CHANGE author_id author_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE opinion CHANGE author_id author_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE opinion_version CHANGE author_id author_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE project CHANGE author_id author_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE proposal CHANGE author_id author_id INT NOT NULL, CHANGE update_author_id update_author_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE reply CHANGE author_id author_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE reporting CHANGE reporter_id reporter_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE source CHANGE author_id author_id INT NOT NULL');
        $this->addSql('ALTER TABLE synthesis_element CHANGE author_id author_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE theme CHANGE author_id author_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE user_favorite_proposal CHANGE user_id user_id INT NOT NULL');
        $this->addSql('ALTER TABLE video CHANGE author_id author_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE votes CHANGE voter_id voter_id INT DEFAULT NULL');
    }
}
