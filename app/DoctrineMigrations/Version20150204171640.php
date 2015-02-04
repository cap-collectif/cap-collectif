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

        $blogMenuItem = $em->getRepository('CapcoAppBundle:MenuItem')->findOneBy(array(
            'link' => 'blog',
            'isDeletable' => 0,
        ));

        if (null == $blogMenuItem) {

            $menu = $em->getRepository('CapcoAppBundle:Menu')->findOneByType(1);

            if (null != $menu) {
                $blogMenuItem = new MenuItem();
                $blogMenuItem->setTitle('Actualités');
                $blogMenuItem->setLink('blog');
                $blogMenuItem->setIsEnabled(true);
                $blogMenuItem->setIsDeletable(false);
                $blogMenuItem->setIsFullyModifiable(false);
                $blogMenuItem->setPosition(2);
                $blogMenuItem->setParent(null);
                $blogMenuItem->setMenu($menu);

                $em->persist($blogMenuItem);
                $em->flush();
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

        $blogMenuItem = $em->getRepository('CapcoAppBundle:MenuItem')->findOneBy(array(
            'link' => 'blog',
            'isDeletable' => 0,
        ));

        if (null != $blogMenuItem) {
            $em->remove($blogMenuItem);
            $em->flush();
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
