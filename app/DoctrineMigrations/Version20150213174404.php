<?php

namespace Application\Migrations;

use Capco\AppBundle\Entity\Menu;
use Capco\AppBundle\Entity\MenuItem;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

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

    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema)
    {
        $toggleManager = $this->container->get('capco.toggle.manager');
        $toggleManager->activate('themes');

        $em = $this->container->get('doctrine.orm.entity_manager');
        $themeMI = $em->getRepository('CapcoAppBundle:MenuItem')->findOneBy(array(
            'link' => 'themes',
            'isDeletable' => false,
        ));

        if (null == $themeMI) {
            $header = $em->getRepository('CapcoAppBundle:Menu')->findOneByType(1);
            if (null != $header) {
                $header = new Menu();
                $header->setType(1);
                $em->persist($header);
            }

            $themeMI = new MenuItem();
            $themeMI->setTitle('Thèmes');
            $themeMI->setLink('themes');
            $themeMI->setIsEnabled(true);
            $themeMI->setIsDeletable(false);
            $themeMI->setIsFullyModifiable(false);
            $themeMI->setPosition(2);
            $themeMI->setParent(null);
            $themeMI->setMenu($header);
            $em->persist($themeMI);
        }

        $themeMI->setAssociatedFeatures(array('themes'));
        $em->persist($themeMI);
        $em->flush();
    }


    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }

    public function postDown(Schema $schema)
    {

        $em = $this->container->get('doctrine.orm.entity_manager');
        $themeMI = $em->getRepository('CapcoAppBundle:MenuItem')->findOneBy(array(
            'link' => 'themes',
            'isDeletable' => false,
        ));

        if (null == $themeMI) {
            $themeMI->setAssociatedFeatures(array());
            $em->persist($themeMI);
            $em->flush();
        }
    }
}
