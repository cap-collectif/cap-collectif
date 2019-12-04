<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20181113145503 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema): void
    {
        $date = (new \DateTime())->format('Y-m-d H:i:s');
        $this->connection->insert('menu_item', [
            'title' => 'Développeurs',
            'link' => 'developer',
            'is_enabled' => false,
            'is_deletable' => 0,
            'associated_features' => 'developer_documentation',
            'is_fully_modifiable' => 0,
            'position' => 28,
            'parent_id' => null,
            'created_at' => $date,
            'updated_at' => $date,
            'menu' => 2,
        ]);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
