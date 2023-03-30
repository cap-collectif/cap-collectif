<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20230330080345 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add cascade delete in progress_step when proposal is deleted';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE progress_step DROP FOREIGN KEY FK_4330D1F5F4792058');
        $this->addSql('ALTER TABLE progress_step ADD CONSTRAINT FK_4330D1F5F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE progress_step DROP FOREIGN KEY FK_4330D1F5F4792058');
        $this->addSql('ALTER TABLE progress_step ADD CONSTRAINT FK_4330D1F5F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)');
    }
}
