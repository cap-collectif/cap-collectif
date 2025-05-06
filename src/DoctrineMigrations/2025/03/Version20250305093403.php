<?php

declare(strict_types=1);

namespace Capco\DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class Version20250305093403 extends AbstractMigration implements ContainerAwareInterface
{
    private EntityManagerInterface $entityManager;
    private UuidGenerator $uuidGenerator;

    public function setContainer(?ContainerInterface $container = null): void
    {
        $this->entityManager = $container->get('doctrine')->getManager();
        $this->uuidGenerator = new UuidGenerator();
    }

    public function getDescription(): string
    {
        return 'Create section & section translations for carrousel highlighted';
    }

    public function up(Schema $schema): void
    {
        $uuidSectionCarrouselHighlighted = $this->uuidGenerator->generate($this->entityManager, null);
        $uuidSectionTranslationEn = $this->uuidGenerator->generate($this->entityManager, null);
        $uuidSectionTranslationFr = $this->uuidGenerator->generate($this->entityManager, null);

        $this->addSql(
            "INSERT INTO `section` (
            `id`, `type`, `position`, `nb_objects`, `enabled`, `created_at`, `updated_at`,
            `associated_features`, `step_id`, `metrics_to_display_basics`, `metrics_to_display_events`,
            `metrics_to_display_projects`, `display_mode`, `center_latitude`, `center_longitude`, `zoom_map`, `is_legend_enabled_on_image`
        )
        VALUES
            ('{$uuidSectionCarrouselHighlighted}', 'carrouselHighlighted', '2', NULL, '0',
            NOW(), NOW(), NULL, NULL, '0', '0', '0',
            'MOST_RECENT', NULL, NULL, NULL, '0')"
        );

        $this->addSql(
            "INSERT INTO `section_translation` (`id`, `translatable_id`, `title`, `teaser`, `body`, `locale`)
        VALUES
            ('{$uuidSectionTranslationEn}', '{$uuidSectionCarrouselHighlighted}', '(New) Highlighted', NULL, NULL, 'en-GB'),
            ('{$uuidSectionTranslationFr}', '{$uuidSectionCarrouselHighlighted}', '(Nouveau) A la une', NULL, NULL, 'fr-FR')"
        );
    }

    public function down(Schema $schema): void
    {
        $this->throwIrreversibleMigrationException();
    }
}
