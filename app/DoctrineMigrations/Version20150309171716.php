<?php

namespace Application\Migrations;

use Capco\AppBundle\Entity\Menu;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
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
        $em = $this->container->get('doctrine.orm.entity_manager');

        $query = $em->createQuery("SELECT m.id FROM Capco\AppBundle\Entity\Menu m WHERE m.type = :type");
        $query->setParameter('type', Menu::TYPE_HEADER);
        $menu = $query->getOneOrNullResult();

        if (null != $menu) {
            $menuId = $menu['id'];
        } else {
            $this->connection->insert('menu', array('type' => Menu::TYPE_HEADER));
            $menuId = $this->connection->lastInsertId();
        }

        $query = $em->createQuery("SELECT mi.id FROM Capco\AppBundle\Entity\MenuItem mi WHERE mi.link = :link AND mi.isDeletable = :isDeletable");
        $query->setParameter('link', 'events');
        $query->setParameter('isDeletable', false);
        $menuItem = $query->getOneOrNullResult();

        if (null == $menuItem) {
            $query = $em->createQuery("SELECT mi.id FROM Capco\AppBundle\Entity\MenuItem mi WHERE mi.link = :link AND mi.isDeletable = :isDeletable");
            $query->setParameter('link', 'event');
            $query->setParameter('isDeletable', false);
            $menuItem = $query->getOneOrNullResult();
        }

        if (null != $menuItem) {

            $this->connection->update('menu_item', array(
                'link' => 'events',
                'associated_features' => 'blog',
                ), array(
                    'id' => $menuItem['id'],
                )
            );

        } else {

            $date = new \DateTime();
            $formattedDate = $date->format('Y-m-d H:i:s');

            $this->connection->insert('menu_item', array(
                'parent_id' => null,
                'menu_id' => $menuId,
                'title' => 'Évènements',
                'link' => 'events',
                'is_enabled' => true,
                'is_deletable' => false,
                'isFullyModifiable' => false,
                'position' => 3,
                'created_at' => $formattedDate,
                'updated_at' => $formattedDate,
                'Page_id' => null,
                'associated_features' => 'blog',
            ));
        }
    }


    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
