<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150206153206 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema)
    {

    }

    public function postUp(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $siteImage = $em->getRepository('CapcoAppBundle:SiteImage')->findOneByKeyname('image.default_avatar');
        if (null != $siteImage) {
            $media = $siteImage->setIsEnabled(false);
            $em->flush();
        }
    }

    public function down(Schema $schema)
    {

    }

    public function postDown(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $siteImage = $em->getRepository('CapcoAppBundle:SiteImage')->findOneByKeyname('image.default_avatar');
        if (null != $siteImage) {
            $media = $siteImage->setIsEnabled(true);
            $em->flush();
        }
    }
}
