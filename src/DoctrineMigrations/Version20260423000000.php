<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260423000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Fix vote_button_icon and action_button_label column defaults to match PHP enum values (lowercase)';
    }

    public function up(Schema $schema): void
    {
        // Use LOWER() to normalize all values regardless of MySQL collation (utf8_general_ci is case-insensitive,
        // so a plain WHERE = 'THUMB_UP' would match 'thumb_up' too but not actually update the stored bytes)
        $this->addSql('UPDATE step SET vote_button_icon = LOWER(vote_button_icon) WHERE BINARY vote_button_icon != LOWER(vote_button_icon)');
        $this->addSql('UPDATE step SET action_button_label = LOWER(action_button_label) WHERE BINARY action_button_label != LOWER(action_button_label)');

        // Fix column defaults to use lowercase values
        $this->addSql("ALTER TABLE step ALTER vote_button_icon SET DEFAULT 'thumb_up'");
        $this->addSql("ALTER TABLE step ALTER action_button_label SET DEFAULT 'vote'");
    }

    public function down(Schema $schema): void
    {
        $this->addSql("UPDATE step SET vote_button_icon = 'THUMB_UP' WHERE vote_button_icon = 'thumb_up'");
        $this->addSql("UPDATE step SET action_button_label = 'VOTE' WHERE action_button_label = 'vote'");
        $this->addSql("ALTER TABLE step ALTER vote_button_icon SET DEFAULT 'THUMB_UP'");
        $this->addSql("ALTER TABLE step ALTER action_button_label SET DEFAULT 'VOTE'");
    }
}
