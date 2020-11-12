<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20201110145448 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE proposal_revision (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', author_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', proposal_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', reason LONGTEXT NOT NULL, revision_state ENUM(\'revised\', \'pending\') COMMENT \'(DC2Type:enum_proposal_revision_state)\' NOT NULL COMMENT \'(DC2Type:enum_proposal_revision_state)\', expires_at DATETIME NOT NULL, revised_at DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, INDEX IDX_8C3829E4F675F31B (author_id), INDEX IDX_8C3829E4F4792058 (proposal_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE proposal_revision ADD CONSTRAINT FK_8C3829E4F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE proposal_revision ADD CONSTRAINT FK_8C3829E4F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE proposal_revision');
    }
}
