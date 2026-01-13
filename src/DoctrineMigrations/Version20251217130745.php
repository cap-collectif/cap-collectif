<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251217130745 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Changing OneToOne relation between Event and Media into a Many(Event)ToOne(Media). Consequently, it removes the unicity constraint on media_id column in event';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE event DROP INDEX UNIQ_3BAE0AA7EA9FDD75, ADD INDEX IDX_3BAE0AA7EA9FDD75 (media_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE event DROP INDEX IDX_3BAE0AA7EA9FDD75, ADD UNIQUE INDEX UNIQ_3BAE0AA7EA9FDD75 (media_id)');
    }
}
