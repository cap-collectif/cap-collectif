<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220608103106 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'district : media & follower';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE district ADD media_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', ADD body LONGTEXT DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE district ADD CONSTRAINT FK_31C15487EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_31C15487EA9FDD75 ON district (media_id)');
        $this->addSql(
            'ALTER TABLE user_following ADD project_district_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE user_following ADD CONSTRAINT FK_715F000778405589 FOREIGN KEY (project_district_id) REFERENCES district (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_715F000778405589 ON user_following (project_district_id)');
        $this->addSql(
            'CREATE UNIQUE INDEX follower_unique_project_district ON user_following (user_id, project_district_id)'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE district DROP FOREIGN KEY FK_31C15487EA9FDD75');
        $this->addSql('DROP INDEX IDX_31C15487EA9FDD75 ON district');
        $this->addSql('ALTER TABLE district DROP media_id, DROP body');
        $this->addSql('ALTER TABLE user_following DROP FOREIGN KEY FK_715F000778405589');
        $this->addSql('DROP INDEX IDX_715F000778405589 ON user_following');
        $this->addSql('DROP INDEX follower_unique_project_district ON user_following');
        $this->addSql('ALTER TABLE user_following DROP project_district_id');
    }
}
