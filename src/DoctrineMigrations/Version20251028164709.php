<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251028164709 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add vote_button_icon and action_button_label fields in step table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE step ADD vote_button_icon VARCHAR(255) DEFAULT \'THUMB_UP\', ADD action_button_label VARCHAR(255) DEFAULT \'VOTE\'');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE step DROP vote_button_icon, DROP action_button_label');
    }
}
