<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20210303111651 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'debateVoteToken';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE debate_vote_token (token VARCHAR(255) NOT NULL, user_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', debate_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', INDEX IDX_BD5EC4AEA76ED395 (user_id), INDEX IDX_BD5EC4AE39A6B6F6 (debate_id), UNIQUE INDEX debate_vote_token_unique (debate_id, user_id), PRIMARY KEY(token)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE debate_vote_token ADD CONSTRAINT FK_BD5EC4AEA76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE debate_vote_token ADD CONSTRAINT FK_BD5EC4AE39A6B6F6 FOREIGN KEY (debate_id) REFERENCES debate (id)'
        );
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE debate_vote_token');
    }
}
