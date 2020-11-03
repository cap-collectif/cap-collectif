<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Enum\AvailableProposalCategoryColor;
use Capco\AppBundle\Enum\AvailableProposalCategoryIcon;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20201026155052 extends AbstractMigration
{
    private const MEDIA_MAPPING = [
        'media-agriculture.svg' => [
            'color' => AvailableProposalCategoryColor::COLOR_1B5E20,
            'icon' => AvailableProposalCategoryIcon::AGRICULTURE_MACHINE_TRACTOR
        ],
        'media-attractivite.svg' => [
            'color' => AvailableProposalCategoryColor::COLOR_880E4F,
            'icon' => AvailableProposalCategoryIcon::SHOPPING_BAG
        ],
        'media-culture.svg' => [
            'color' => AvailableProposalCategoryColor::COLOR_EF5350,
            'icon' => AvailableProposalCategoryIcon::OFFICIAL_BUILDING
        ],
        'media-environnement.svg' => [
            'color' => AvailableProposalCategoryColor::COLOR_558B2F,
            'icon' => AvailableProposalCategoryIcon::ECOLOGY_LEAF
        ],
        'media-jeunesse.svg' => [
            'color' => AvailableProposalCategoryColor::COLOR_C2185B,
            'icon' => AvailableProposalCategoryIcon::FAMILY_CHILD_PLAY_BALL
        ],
        'media-mobilite.svg' => [
            'color' => AvailableProposalCategoryColor::COLOR_004D40,
            'icon' => AvailableProposalCategoryIcon::BICYCLE
        ],
        'media-pmr.svg' => [
            'color' => AvailableProposalCategoryColor::COLOR_795548,
            'icon' => AvailableProposalCategoryIcon::PARAPLEGIC
        ],
        'media-proprete.svg' => [
            'color' => AvailableProposalCategoryColor::COLOR_673AB7,
            'icon' => AvailableProposalCategoryIcon::BIN
        ],
        'media-qualite-de-vie.svg' => [
            'color' => AvailableProposalCategoryColor::COLOR_78909C,
            'icon' => AvailableProposalCategoryIcon::PARK_BENCH_LIGHT
        ],
        'media-sante.svg' => [
            'color' => AvailableProposalCategoryColor::COLOR_455A64,
            'icon' => AvailableProposalCategoryIcon::HOSPITAL
        ],
        'media-scolarite.svg' => [
            'color' => AvailableProposalCategoryColor::COLOR_3F51B5,
            'icon' => AvailableProposalCategoryIcon::GRADUATE
        ],
        'media-securite.svg' => [
            'color' => AvailableProposalCategoryColor::COLOR_BF360C,
            'icon' => AvailableProposalCategoryIcon::CONSTRUCTION_CONE
        ],
        'media-solidarite.svg' => [
            'color' => AvailableProposalCategoryColor::COLOR_B71C1C,
            'icon' => AvailableProposalCategoryIcon::SOLIDARITY
        ],
        'media-sport.svg' => [
            'color' => AvailableProposalCategoryColor::COLOR_616161,
            'icon' => AvailableProposalCategoryIcon::BASKETBALL_BALL
        ],
        'media-urbanisme.svg' => [
            'color' => AvailableProposalCategoryColor::COLOR_827717,
            'icon' => AvailableProposalCategoryIcon::URBANISM
        ],
    ];

    public function getDescription(): string
    {
        return 'Add color and icon fields to proposal_category';
    }

    public function postUp(Schema $schema): void
    {
        $categoriesWithDefaultImage = $this->connection->executeQuery(<<<SQL
SELECT proposal_category.id AS proposal_category_id, media__media.provider_metadata FROM proposal_category
LEFT JOIN category_image ON proposal_category.category_media_id = category_image.id
LEFT JOIN media__media ON category_image.image_id = media__media.id
WHERE category_image.is_default = 1
SQL
        )->fetchAll();
        $informations = array_map(static fn(array $category) => [
            'proposal_category_id' => $category['proposal_category_id'],
            'filename' => json_decode($category['provider_metadata'], true)['filename']
        ], $categoriesWithDefaultImage);

        echo '-> Migrating old default images to new format...' . PHP_EOL;

        foreach ($informations as $information) {
            $metadata = self::MEDIA_MAPPING[$information['filename']];
            $this->connection->update('proposal_category', [
                'color' => $metadata['color'],
                'icon' => $metadata['icon'],
                'category_media_id' => null,
            ], ['id' => $information['proposal_category_id']]);
        }
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE proposal_category ADD color VARCHAR(7) NOT NULL, ADD icon VARCHAR(100) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE proposal_category DROP color, DROP icon');
    }
}
