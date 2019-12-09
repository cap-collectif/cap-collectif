<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Capco\AppBundle\Toggle\Manager;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150213174404 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    /**
     * Sets the Container.
     *
     * @param ContainerInterface|null $container A ContainerInterface instance or null
     *
     * @api
     */
    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema): void
    {
        $toggleManager = $this->container->get(Manager::class);
        $toggleManager->activate('themes');

        $themeMIId = $this->connection->fetchColumn(
            'SELECT id FROM menu_item WHERE link = :link AND is_deletable = :deletable',
            ['link' => 'themes', 'deletable' => false]
        );

        if (!$themeMIId) {
            $headerId = $this->connection->fetchColumn('SELECT id FROM menu WHERE type = 1');

            // If we havn't a header yet, we want to get one
            if (!$headerId) {
                $this->connection->insert('menu', ['type' => 1]);
                $headerId = $this->connection->lastInsertId();
            }

            $date = (new \DateTime())->format('Y-m-d H:i:s');
            $this->connection->insert('menu_item', [
                'title' => 'Thèmes',
                'link' => 'themes',
                'is_enabled' => true,
                'is_deletable' => false,
                'isFullyModifiable' => false,
                'position' => 2,
                'parent_id' => null,
                'menu_id' => $headerId,
                'created_at' => $date,
                'updated_at' => $date
            ]);
        }

        $this->connection->update(
            'menu_item',
            ['associated_features' => 'themes'],
            ['link' => 'themes', 'is_deletable' => false]
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }

    public function postDown(Schema $schema): void
    {
        $themeMIId = $this->connection->fetchColumn(
            'SELECT id FROM menu_item WHERE link = :link AND is_deletable = :deletable',
            ['link' => 'themes', 'deletable' => false]
        );

        if (null !== $themeMIId) {
            $this->connection->update(
                'menu_item',
                ['associated_features' => 'themes'],
                ['id' => $themeMIId]
            );
        }
    }
}
