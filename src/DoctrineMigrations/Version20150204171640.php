<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150204171640 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema): void
    {
        $blogMenuItemId = $this->connection->fetchOne(
            'SELECT id FROM menu_item WHERE link = :link AND is_deletable = :deletable',
            ['link' => 'blog', 'deletable' => 0]
        );

        if (!$blogMenuItemId) {
            $menuId = $this->connection->fetchOne('SELECT id FROM menu WHERE type = 1');

            if (!$menuId) {
                $this->connection->insert('menu', ['type' => 1]);
                $menuId = $this->connection->lastInsertId();
            }

            $date = (new \DateTime())->format('Y-m-d H:i:s');
            $this->connection->insert('menu_item', [
                'title' => 'Actualités',
                'link' => 'blog',
                'is_enabled' => 1,
                'is_deletable' => 0,
                'isFullyModifiable' => 0,
                'position' => 2,
                'menu_id' => $menuId,
                'parent_id' => null,
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }

    public function postDown(Schema $schema): void
    {
        $blogMenuItemId = $this->connection->fetchOne(
            'SELECT id FROM menu_item WHERE link = :link AND is_deletable = :deletable',
            ['link' => 'blog', 'deletable' => 0]
        );

        if (null !== $blogMenuItemId) {
            $this->connection->delete('menu_item', ['id' => $blogMenuItemId]);
        }
    }

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
}
