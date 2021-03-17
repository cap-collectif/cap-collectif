<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20210315141801 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Cascade Delete on DebateArticle from Debate';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE debate_article DROP FOREIGN KEY FK_F8237AAC39A6B6F6');
        $this->addSql(
            'ALTER TABLE debate_article ADD CONSTRAINT FK_F8237AAC39A6B6F6 FOREIGN KEY (debate_id) REFERENCES debate (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE debate_article DROP FOREIGN KEY FK_F8237AAC39A6B6F6');
        $this->addSql(
            'ALTER TABLE debate_article ADD CONSTRAINT FK_F8237AAC39A6B6F6 FOREIGN KEY (debate_id) REFERENCES debate (id)'
        );
    }
}
