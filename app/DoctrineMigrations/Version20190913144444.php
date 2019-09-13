<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190913144444 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE user_following ADD opinion_version_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE user_following ADD CONSTRAINT FK_715F0007D077154C FOREIGN KEY (opinion_version_id) REFERENCES opinion_version (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_715F0007D077154C ON user_following (opinion_version_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE user_following DROP FOREIGN KEY FK_715F0007D077154C');
        $this->addSql('DROP INDEX IDX_715F0007D077154C ON user_following');
        $this->addSql('ALTER TABLE user_following DROP opinion_version_id');
    }
}
