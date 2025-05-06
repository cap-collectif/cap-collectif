<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241115081929 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'remove existing temporary_id in question and question_choice';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('UPDATE question SET temporary_id = NULL');
        $this->addSql('UPDATE question_choice SET temporary_id = NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
