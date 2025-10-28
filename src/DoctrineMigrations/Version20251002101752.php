<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251002101752 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add carrousel section';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("INSERT INTO section (id, step_id, type, position, nb_objects, enabled, metrics_to_display_basics, metrics_to_display_events, metrics_to_display_projects, display_mode, created_at, updated_at, associated_features, center_latitude, center_longitude, is_legend_enabled_on_image, zoom_map) VALUES ('sectionCarrousel', null, 'carrousel', 15, 8, 0, 0, 0, 0, 'MOST_RECENT', NOW(), NOW(), null, null, null, 1, null)");
        $this->addSql("INSERT INTO section_translation (id, translatable_id, title, teaser, body, locale) VALUES (UUID(), 'sectionCarrousel', 'Carrousel', null, null, 'en-GB')");
        $this->addSql("INSERT INTO section_translation (id, translatable_id, title, teaser, body, locale) VALUES (UUID(), 'sectionCarrousel', 'En-tête défilante', null, null, 'fr-FR')");
    }

    public function down(Schema $schema): void
    {
    }
}
