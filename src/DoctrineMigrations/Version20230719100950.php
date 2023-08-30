<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20230719100950 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Creates proposal_statistics table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE proposal_statistics (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', proposal_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', nbr_of_messages_sent_to_author INT NOT NULL, UNIQUE INDEX UNIQ_90E1B854F4792058 (proposal_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE proposal_statistics ADD CONSTRAINT FK_90E1B854F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE proposal_statistics');
    }
}
