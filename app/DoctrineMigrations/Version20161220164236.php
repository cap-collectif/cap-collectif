<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20161220164236 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');
        //
        // $this->addSql('ALTER TABLE proposal ADD CONSTRAINT FK_BFE59472F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE');
        // $this->addSql('ALTER TABLE proposal ADD CONSTRAINT FK_BFE594725760469E FOREIGN KEY (update_author_id) REFERENCES fos_user (id) ON DELETE CASCADE');
        // $this->addSql('CREATE INDEX IDX_BFE59472F675F31B ON proposal (author_id)');
        // $this->addSql('CREATE INDEX IDX_BFE594725760469E ON proposal (update_author_id)');
        // $this->addSql('ALTER TABLE user_favorite_proposal ADD PRIMARY KEY (proposal_id, user_id)');
        // $this->addSql('ALTER TABLE user_favorite_proposal ADD CONSTRAINT FK_EDAD37A8A76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id) ON DELETE CASCADE');
        // $this->addSql('CREATE INDEX IDX_EDAD37A8A76ED395 ON user_favorite_proposal (user_id)');
        // $this->addSql('ALTER TABLE theme CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE theme ADD CONSTRAINT FK_9775E708F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE SET NULL');
        // $this->addSql('CREATE INDEX IDX_9775E708F675F31B ON theme (author_id)');
        // $this->addSql('ALTER TABLE comment CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE comment ADD CONSTRAINT FK_9474526CF675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE');
        // $this->addSql('CREATE INDEX IDX_9474526CF675F31B ON comment (author_id)');
        // $this->addSql('ALTER TABLE reporting CHANGE reporter_id reporter_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9FE1CFE6F5 FOREIGN KEY (reporter_id) REFERENCES fos_user (id) ON DELETE CASCADE');
        // $this->addSql('CREATE INDEX IDX_BD7CFA9FE1CFE6F5 ON reporting (reporter_id)');
        // $this->addSql('ALTER TABLE votes ADD CONSTRAINT FK_518B7ACFEBB4B8AD FOREIGN KEY (voter_id) REFERENCES fos_user (id) ON DELETE CASCADE');
        // $this->addSql('CREATE INDEX IDX_518B7ACFEBB4B8AD ON votes (voter_id)');
        // $this->addSql('ALTER TABLE answer ADD CONSTRAINT FK_DADD4A25F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE');
        // $this->addSql('CREATE INDEX IDX_DADD4A25F675F31B ON answer (author_id)');
        // $this->addSql('ALTER TABLE opinion CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE opinion ADD CONSTRAINT FK_AB02B027F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE');
        // $this->addSql('CREATE INDEX IDX_AB02B027F675F31B ON opinion (author_id)');
        // $this->addSql('ALTER TABLE opinion_version CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE opinion_version ADD CONSTRAINT FK_52AD19DDF675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE');
        // $this->addSql('CREATE INDEX IDX_52AD19DDF675F31B ON opinion_version (author_id)');
        // $this->addSql('ALTER TABLE idea CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE idea ADD CONSTRAINT FK_A8BCA45F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE');
        // $this->addSql('CREATE INDEX IDX_A8BCA45F675F31B ON idea (author_id)');
        // $this->addSql('ALTER TABLE argument CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE argument ADD CONSTRAINT FK_D113B0AF675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE');
        // $this->addSql('CREATE INDEX IDX_D113B0AF675F31B ON argument (author_id)');
        // $this->addSql('ALTER TABLE source ADD CONSTRAINT FK_5F8A7F73F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE');
        // $this->addSql('CREATE INDEX IDX_5F8A7F73F675F31B ON source (author_id)');
        // $this->addSql('ALTER TABLE reply CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE reply ADD CONSTRAINT FK_FDA8C6E0F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE');
        // $this->addSql('CREATE INDEX IDX_FDA8C6E0F675F31B ON reply (author_id)');
        // $this->addSql('ALTER TABLE project CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE project ADD CONSTRAINT FK_2FB3D0EEF675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE SET NULL');
        // $this->addSql('CREATE INDEX IDX_2FB3D0EEF675F31B ON project (author_id)');
        // $this->addSql('ALTER TABLE event CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE event ADD CONSTRAINT FK_3BAE0AA7F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE');
        // $this->addSql('CREATE INDEX IDX_3BAE0AA7F675F31B ON event (author_id)');
        // $this->addSql('ALTER TABLE blog_post_authors ADD PRIMARY KEY (post_id, user_id)');
        // $this->addSql('ALTER TABLE blog_post_authors ADD CONSTRAINT FK_E93872E5A76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id) ON DELETE CASCADE');
        // $this->addSql('CREATE INDEX IDX_E93872E5A76ED395 ON blog_post_authors (user_id)');
        // $this->addSql('ALTER TABLE event_registration ADD CONSTRAINT FK_8FBBAD54A76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id) ON DELETE CASCADE');
        // $this->addSql('CREATE INDEX IDX_8FBBAD54A76ED395 ON event_registration (user_id)');
        // $this->addSql('ALTER TABLE synthesis_element ADD CONSTRAINT FK_97652E1BF675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE SET NULL');
        // $this->addSql('CREATE INDEX IDX_97652E1BF675F31B ON synthesis_element (author_id)');
        // $this->addSql('ALTER TABLE video CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        // $this->addSql('ALTER TABLE video ADD CONSTRAINT FK_7CC7DA2CF675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE');
        // $this->addSql('CREATE INDEX IDX_7CC7DA2CF675F31B ON video (author_id)');
        // $this->addSql('DROP INDEX id_username_idx ON fos_user');
        // $this->addSql('CREATE INDEX id_username_idx ON fos_user (id, username)');
        // $this->addSql('ALTER TABLE fos_user_user_group ADD PRIMARY KEY (user_id, group_id)');
        // $this->addSql('ALTER TABLE fos_user_user_group ADD CONSTRAINT FK_B3C77447A76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id) ON DELETE CASCADE');
        // $this->addSql('CREATE INDEX IDX_B3C77447A76ED395 ON fos_user_user_group (user_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE answer DROP FOREIGN KEY FK_DADD4A25F675F31B');
        $this->addSql('DROP INDEX IDX_DADD4A25F675F31B ON answer');
        $this->addSql('ALTER TABLE argument DROP FOREIGN KEY FK_D113B0AF675F31B');
        $this->addSql('DROP INDEX IDX_D113B0AF675F31B ON argument');
        $this->addSql('ALTER TABLE argument CHANGE author_id author_id CHAR(36) NOT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE blog_post_authors DROP FOREIGN KEY FK_E93872E5A76ED395');
        $this->addSql('DROP INDEX IDX_E93872E5A76ED395 ON blog_post_authors');
        $this->addSql('ALTER TABLE blog_post_authors DROP PRIMARY KEY');
        $this->addSql('ALTER TABLE comment DROP FOREIGN KEY FK_9474526CF675F31B');
        $this->addSql('DROP INDEX IDX_9474526CF675F31B ON comment');
        $this->addSql('ALTER TABLE comment CHANGE author_id author_id CHAR(36) NOT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE event DROP FOREIGN KEY FK_3BAE0AA7F675F31B');
        $this->addSql('DROP INDEX IDX_3BAE0AA7F675F31B ON event');
        $this->addSql('ALTER TABLE event CHANGE author_id author_id CHAR(36) NOT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE event_registration DROP FOREIGN KEY FK_8FBBAD54A76ED395');
        $this->addSql('DROP INDEX IDX_8FBBAD54A76ED395 ON event_registration');
        $this->addSql('DROP INDEX id_username_idx ON fos_user');
        $this->addSql('CREATE INDEX id_username_idx ON fos_user (username)');
        $this->addSql('ALTER TABLE fos_user_user_group DROP FOREIGN KEY FK_B3C77447A76ED395');
        $this->addSql('DROP INDEX IDX_B3C77447A76ED395 ON fos_user_user_group');
        $this->addSql('ALTER TABLE fos_user_user_group DROP PRIMARY KEY');
        $this->addSql('ALTER TABLE idea DROP FOREIGN KEY FK_A8BCA45F675F31B');
        $this->addSql('DROP INDEX IDX_A8BCA45F675F31B ON idea');
        $this->addSql('ALTER TABLE idea CHANGE author_id author_id CHAR(36) NOT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE opinion DROP FOREIGN KEY FK_AB02B027F675F31B');
        $this->addSql('DROP INDEX IDX_AB02B027F675F31B ON opinion');
        $this->addSql('ALTER TABLE opinion CHANGE author_id author_id CHAR(36) NOT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE opinion_version DROP FOREIGN KEY FK_52AD19DDF675F31B');
        $this->addSql('DROP INDEX IDX_52AD19DDF675F31B ON opinion_version');
        $this->addSql('ALTER TABLE opinion_version CHANGE author_id author_id CHAR(36) NOT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE project DROP FOREIGN KEY FK_2FB3D0EEF675F31B');
        $this->addSql('DROP INDEX IDX_2FB3D0EEF675F31B ON project');
        $this->addSql('ALTER TABLE project CHANGE author_id author_id CHAR(36) NOT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE59472F675F31B');
        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE594725760469E');
        $this->addSql('DROP INDEX IDX_BFE59472F675F31B ON proposal');
        $this->addSql('DROP INDEX IDX_BFE594725760469E ON proposal');
        $this->addSql('ALTER TABLE reply DROP FOREIGN KEY FK_FDA8C6E0F675F31B');
        $this->addSql('DROP INDEX IDX_FDA8C6E0F675F31B ON reply');
        $this->addSql('ALTER TABLE reply CHANGE author_id author_id CHAR(36) NOT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9FE1CFE6F5');
        $this->addSql('DROP INDEX IDX_BD7CFA9FE1CFE6F5 ON reporting');
        $this->addSql('ALTER TABLE reporting CHANGE reporter_id reporter_id CHAR(36) NOT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE source DROP FOREIGN KEY FK_5F8A7F73F675F31B');
        $this->addSql('DROP INDEX IDX_5F8A7F73F675F31B ON source');
        $this->addSql('ALTER TABLE synthesis_element DROP FOREIGN KEY FK_97652E1BF675F31B');
        $this->addSql('DROP INDEX IDX_97652E1BF675F31B ON synthesis_element');
        $this->addSql('ALTER TABLE theme DROP FOREIGN KEY FK_9775E708F675F31B');
        $this->addSql('DROP INDEX IDX_9775E708F675F31B ON theme');
        $this->addSql('ALTER TABLE theme CHANGE author_id author_id CHAR(36) NOT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE user_favorite_proposal DROP FOREIGN KEY FK_EDAD37A8A76ED395');
        $this->addSql('DROP INDEX IDX_EDAD37A8A76ED395 ON user_favorite_proposal');
        $this->addSql('ALTER TABLE user_favorite_proposal DROP PRIMARY KEY');
        $this->addSql('ALTER TABLE video DROP FOREIGN KEY FK_7CC7DA2CF675F31B');
        $this->addSql('DROP INDEX IDX_7CC7DA2CF675F31B ON video');
        $this->addSql('ALTER TABLE video CHANGE author_id author_id CHAR(36) NOT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACFEBB4B8AD');
        $this->addSql('DROP INDEX IDX_518B7ACFEBB4B8AD ON votes');
    }
}
