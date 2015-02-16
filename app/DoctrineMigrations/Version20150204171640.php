<?php

namespace Application\Migrations;

use Capco\AppBundle\Entity\MenuItem;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150204171640 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $query = $em->createQuery("SELECT mi.id FROM Capco\AppBundle\Entity\MenuItem mi WHERE mi.link = 'blog' AND mi.isDeletable = 0");
        $blogMenuItem = $query->getOneOrNullResult();

        if (null == $blogMenuItem) {
            $query = $em->createQuery("SELECT m.id FROM Capco\AppBundle\Entity\Menu m WHERE m.type = 1");
            $menu = $query->getOneOrNullResult();

            if (null != $menu) {
                $this->addSql("INSERT INTO menu_item (title, link, is_enabled, is_deletable, isFullyModifiable, position, menu_id, parent_id) VALUES ('Actualités', 'blog', TRUE, FALSE, FALSE, 2, NULL, $blogMenuItem)");
            }
        }

    }

    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }

    public function postDown(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $query = $em->createQuery("SELECT mi.id FROM Capco\AppBundle\Entity\MenuItem mi WHERE mi.link = 'blog' AND mi.isDeletable = 0");
        $blogMenuItem = $query->getOneOrNullResult();

        if (null != $blogMenuItem) {
            $this->addSql("DELETE FROM menu_item WHERE id = $blogMenuItem");
        }
    }

    /**
     * Sets the Container.
     *
     * @param ContainerInterface|null $container A ContainerInterface instance or null
     *
     * @api
     */public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }
}
