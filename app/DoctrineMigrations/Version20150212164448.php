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
class Version20150212164448 extends AbstractMigration implements ContainerAwareInterface
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

    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema)
    {
        $ideasMIId = $this->connection->fetchColumn(
            'SELECT id FROM menu_item WHERE link = :link AND is_deletable = :deletable',
            ['link' => 'ideas', 'deletable' => false]
        );

        if (null !== $ideasMIId) {
            $this->connection->update(
                'menu_item',
                array('associated_features' => 'ideas'),
                array('id' => $ideasMIId)
            );
        }

        $toggleManager = $this->container->get(Manager::class);
        $toggleManager->activate('ideas');
    }

    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
    }

    public function postDown(Schema $schema)
    {
        $ideasMIId = $this->connection->fetchColumn(
            'SELECT id FROM menu_item WHERE link = :link AND is_deletable = :deletable',
            ['link' => 'ideas', 'deletable' => false]
        );

        if (null !== $ideasMIId) {
            $this->connection->update(
                'menu_item',
                array('associated_features' => 'ideas'),
                array('id' => $ideasMIId)
            );
        }
    }
}
