<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220711114158 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'authorable can be an organization';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE answer ADD organization_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE answer ADD CONSTRAINT FK_DADD4A2532C8A3DE FOREIGN KEY (organization_id) REFERENCES organization (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_DADD4A2532C8A3DE ON answer (organization_id)');
        $this->addSql('ALTER TABLE comment ADD organization_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE comment ADD CONSTRAINT FK_9474526C32C8A3DE FOREIGN KEY (organization_id) REFERENCES organization (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_9474526C32C8A3DE ON comment (organization_id)');
        $this->addSql('ALTER TABLE debate_argument ADD organization_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE debate_argument ADD CONSTRAINT FK_765A09D032C8A3DE FOREIGN KEY (organization_id) REFERENCES organization (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_765A09D032C8A3DE ON debate_argument (organization_id)');
        $this->addSql('ALTER TABLE debate_opinion ADD organization_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE debate_opinion ADD CONSTRAINT FK_511BC4ED32C8A3DE FOREIGN KEY (organization_id) REFERENCES organization (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_511BC4ED32C8A3DE ON debate_opinion (organization_id)');
        $this->addSql('ALTER TABLE event ADD organization_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE event ADD CONSTRAINT FK_3BAE0AA732C8A3DE FOREIGN KEY (organization_id) REFERENCES organization (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_3BAE0AA732C8A3DE ON event (organization_id)');
        $this->addSql('ALTER TABLE opinion ADD organization_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE opinion ADD CONSTRAINT FK_AB02B02732C8A3DE FOREIGN KEY (organization_id) REFERENCES organization (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_AB02B02732C8A3DE ON opinion (organization_id)');
        $this->addSql('ALTER TABLE opinion_version ADD organization_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE opinion_version ADD CONSTRAINT FK_52AD19DD32C8A3DE FOREIGN KEY (organization_id) REFERENCES organization (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_52AD19DD32C8A3DE ON opinion_version (organization_id)');
        $this->addSql('ALTER TABLE project_author ADD organization_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', CHANGE user_id user_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE project_author ADD CONSTRAINT FK_AA0B338232C8A3DE FOREIGN KEY (organization_id) REFERENCES organization (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_AA0B338232C8A3DE ON project_author (organization_id)');
        $this->addSql('ALTER TABLE proposal ADD organization_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE proposal ADD CONSTRAINT FK_BFE5947232C8A3DE FOREIGN KEY (organization_id) REFERENCES organization (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_BFE5947232C8A3DE ON proposal (organization_id)');
        $this->addSql('ALTER TABLE reply ADD organization_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE reply ADD CONSTRAINT FK_FDA8C6E032C8A3DE FOREIGN KEY (organization_id) REFERENCES organization (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_FDA8C6E032C8A3DE ON reply (organization_id)');
        $this->addSql('ALTER TABLE source ADD organization_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', CHANGE author_id author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE source ADD CONSTRAINT FK_5F8A7F7332C8A3DE FOREIGN KEY (organization_id) REFERENCES organization (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_5F8A7F7332C8A3DE ON source (organization_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE answer DROP FOREIGN KEY FK_DADD4A2532C8A3DE');
        $this->addSql('DROP INDEX IDX_DADD4A2532C8A3DE ON answer');
        $this->addSql('ALTER TABLE answer DROP organization_id, CHANGE author_id author_id CHAR(36) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE comment DROP FOREIGN KEY FK_9474526C32C8A3DE');
        $this->addSql('DROP INDEX IDX_9474526C32C8A3DE ON comment');
        $this->addSql('ALTER TABLE comment DROP organization_id');
        $this->addSql('ALTER TABLE debate_argument DROP FOREIGN KEY FK_765A09D032C8A3DE');
        $this->addSql('DROP INDEX IDX_765A09D032C8A3DE ON debate_argument');
        $this->addSql('ALTER TABLE debate_argument DROP organization_id, CHANGE author_id author_id CHAR(36) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE debate_opinion DROP FOREIGN KEY FK_511BC4ED32C8A3DE');
        $this->addSql('DROP INDEX IDX_511BC4ED32C8A3DE ON debate_opinion');
        $this->addSql('ALTER TABLE debate_opinion DROP organization_id, CHANGE author_id author_id CHAR(36) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE event DROP FOREIGN KEY FK_3BAE0AA732C8A3DE');
        $this->addSql('DROP INDEX IDX_3BAE0AA732C8A3DE ON event');
        $this->addSql('ALTER TABLE event DROP organization_id');
        $this->addSql('ALTER TABLE opinion DROP FOREIGN KEY FK_AB02B02732C8A3DE');
        $this->addSql('DROP INDEX IDX_AB02B02732C8A3DE ON opinion');
        $this->addSql('ALTER TABLE opinion DROP organization_id');
        $this->addSql('ALTER TABLE opinion_version DROP FOREIGN KEY FK_52AD19DD32C8A3DE');
        $this->addSql('DROP INDEX IDX_52AD19DD32C8A3DE ON opinion_version');
        $this->addSql('ALTER TABLE opinion_version DROP organization_id');
        $this->addSql('ALTER TABLE project_author DROP FOREIGN KEY FK_AA0B338232C8A3DE');
        $this->addSql('DROP INDEX IDX_AA0B338232C8A3DE ON project_author');
        $this->addSql('ALTER TABLE project_author DROP organization_id, CHANGE user_id user_id CHAR(36) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE5947232C8A3DE');
        $this->addSql('DROP INDEX IDX_BFE5947232C8A3DE ON proposal');
        $this->addSql('ALTER TABLE proposal DROP organization_id, CHANGE author_id author_id CHAR(36) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE reply DROP FOREIGN KEY FK_FDA8C6E032C8A3DE');
        $this->addSql('DROP INDEX IDX_FDA8C6E032C8A3DE ON reply');
        $this->addSql('ALTER TABLE reply DROP organization_id');
        $this->addSql('ALTER TABLE source DROP FOREIGN KEY FK_5F8A7F7332C8A3DE');
        $this->addSql('DROP INDEX IDX_5F8A7F7332C8A3DE ON source');
        $this->addSql('ALTER TABLE source DROP organization_id, CHANGE author_id author_id CHAR(36) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\'');
    }
}
