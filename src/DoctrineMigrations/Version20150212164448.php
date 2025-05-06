<?php

namespace Application\Migrations;

use Capco\AppBundle\Toggle\Manager;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150212164448 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

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
        $ideasMIId = $this->connection->fetchOne(
            'SELECT id FROM menu_item WHERE link = :link AND is_deletable = :deletable',
            ['link' => 'ideas', 'deletable' => 0]
        );

        if (null !== $ideasMIId) {
            $this->connection->update(
                'menu_item',
                ['associated_features' => 'ideas'],
                ['id' => $ideasMIId]
            );
        }

        $toggleManager = $this->container->get(Manager::class);
        $toggleManager->activate('ideas');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }

    public function postDown(Schema $schema): void
    {
        $ideasMIId = $this->connection->fetchOne(
            'SELECT id FROM menu_item WHERE link = :link AND is_deletable = :deletable',
            ['link' => 'ideas', 'deletable' => 0]
        );

        if (null !== $ideasMIId) {
            $this->connection->update(
                'menu_item',
                ['associated_features' => 'ideas'],
                ['id' => $ideasMIId]
            );
        }
    }
}
