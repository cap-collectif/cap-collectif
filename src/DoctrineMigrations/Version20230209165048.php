<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20230209165048 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE debate_vote_token DROP FOREIGN KEY FK_BD5EC4AE39A6B6F6');
        $this->addSql('ALTER TABLE debate_vote_token ADD CONSTRAINT FK_BD5EC4AE39A6B6F6 FOREIGN KEY (debate_id) REFERENCES debate (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE debate_vote_token DROP FOREIGN KEY FK_BD5EC4AE39A6B6F6');
        $this->addSql('ALTER TABLE debate_vote_token ADD CONSTRAINT FK_BD5EC4AE39A6B6F6 FOREIGN KEY (debate_id) REFERENCES debate (id)');
    }
}
