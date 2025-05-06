<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150309171716 extends AbstractMigration implements ContainerAwareInterface
{
    protected $container;

    /**
     * Sets the Container.
     *
     * @param null|ContainerInterface $container A ContainerInterface instance or null
     *
     * @api
     */
    public function setContainer(?ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema): void
    {
        $menuId = $this->connection->fetchOne('SELECT id FROM menu WHERE type = 1');

        if (!$menuId) {
            $this->connection->insert('menu', ['type' => 1]);
            $menuId = $this->connection->lastInsertId();
        }

        $menuItemId = $this->connection->fetchOne(
            'SELECT id FROM menu_item WHERE link = :link AND is_deletable = :deletable',
            ['link' => 'events', 'deletable' => 0]
        );

        if (!$menuItemId) {
            $menuItemId = $this->connection->fetchOne(
                'SELECT id FROM menu_item WHERE link = :link AND is_deletable = :deletable',
                ['link' => 'event', 'deletable' => 0]
            );
        }

        if (null !== $menuItemId) {
            $this->connection->update(
                'menu_item',
                ['link' => 'events', 'associated_features' => 'blog'],
                ['id' => $menuItemId]
            );
        } else {
            $date = new \DateTime();
            $formattedDate = $date->format('Y-m-d H:i:s');

            $this->connection->insert('menu_item', [
                'parent_id' => null,
                'menu_id' => $menuId,
                'title' => 'Évènements',
                'link' => 'events',
                'is_enabled' => 1,
                'is_deletable' => 0,
                'isFullyModifiable' => 0,
                'position' => 3,
                'created_at' => $formattedDate,
                'updated_at' => $formattedDate,
                'Page_id' => null,
                'associated_features' => 'blog',
            ]);
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
