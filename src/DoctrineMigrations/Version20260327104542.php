<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260327104542 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE project_tab (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', project_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', title VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, enabled TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, position INT NOT NULL, type VARCHAR(255) NOT NULL, INDEX IDX_E19899EF166D1F9C (project_id), UNIQUE INDEX project_tab_project_slug_unique (project_id, slug), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE project_tab_custom (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', body LONGTEXT DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE project_tab_event_item (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', project_tab_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', event_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', position INT NOT NULL, INDEX IDX_D4DFA8569AA87869 (project_tab_id), INDEX IDX_D4DFA85671F7E88B (event_id), UNIQUE INDEX project_tab_event_item_unique (project_tab_id, event_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE project_tab_events (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE project_tab_news (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE project_tab_news_item (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', project_tab_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', post_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', position INT NOT NULL, INDEX IDX_7E37D2F69AA87869 (project_tab_id), INDEX IDX_7E37D2F64B89032C (post_id), UNIQUE INDEX project_tab_news_item_unique (project_tab_id, post_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE project_tab_presentation (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', body LONGTEXT DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE project_tab ADD CONSTRAINT FK_E19899EF166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE project_tab_custom ADD CONSTRAINT FK_4C832AE1BF396750 FOREIGN KEY (id) REFERENCES project_tab (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE project_tab_event_item ADD CONSTRAINT FK_D4DFA8569AA87869 FOREIGN KEY (project_tab_id) REFERENCES project_tab_events (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE project_tab_event_item ADD CONSTRAINT FK_D4DFA85671F7E88B FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE project_tab_events ADD CONSTRAINT FK_EA806B30BF396750 FOREIGN KEY (id) REFERENCES project_tab (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE project_tab_news ADD CONSTRAINT FK_9E5F3C8EBF396750 FOREIGN KEY (id) REFERENCES project_tab (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE project_tab_news_item ADD CONSTRAINT FK_7E37D2F69AA87869 FOREIGN KEY (project_tab_id) REFERENCES project_tab_news (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE project_tab_news_item ADD CONSTRAINT FK_7E37D2F64B89032C FOREIGN KEY (post_id) REFERENCES blog_post (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE project_tab_presentation ADD CONSTRAINT FK_2566E95BF396750 FOREIGN KEY (id) REFERENCES project_tab (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE project_tab_custom DROP FOREIGN KEY FK_4C832AE1BF396750');
        $this->addSql('ALTER TABLE project_tab_events DROP FOREIGN KEY FK_EA806B30BF396750');
        $this->addSql('ALTER TABLE project_tab_news DROP FOREIGN KEY FK_9E5F3C8EBF396750');
        $this->addSql('ALTER TABLE project_tab_presentation DROP FOREIGN KEY FK_2566E95BF396750');
        $this->addSql('ALTER TABLE project_tab_event_item DROP FOREIGN KEY FK_D4DFA8569AA87869');
        $this->addSql('ALTER TABLE project_tab_news_item DROP FOREIGN KEY FK_7E37D2F69AA87869');
        $this->addSql('DROP TABLE project_tab');
        $this->addSql('DROP TABLE project_tab_custom');
        $this->addSql('DROP TABLE project_tab_event_item');
        $this->addSql('DROP TABLE project_tab_events');
        $this->addSql('DROP TABLE project_tab_news');
        $this->addSql('DROP TABLE project_tab_news_item');
        $this->addSql('DROP TABLE project_tab_presentation');
    }
}
