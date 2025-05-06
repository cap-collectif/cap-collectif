<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20231214100033 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add participant ON DELETE CASCADE in reply';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE reply DROP FOREIGN KEY FK_FDA8C6E09D1C3019');
        $this->addSql('ALTER TABLE reply ADD CONSTRAINT FK_FDA8C6E09D1C3019 FOREIGN KEY (participant_id) REFERENCES participant (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE reply DROP FOREIGN KEY FK_FDA8C6E09D1C3019');
        $this->addSql('ALTER TABLE reply ADD CONSTRAINT FK_FDA8C6E09D1C3019 FOREIGN KEY (participant_id) REFERENCES participant (id)');
    }
}
