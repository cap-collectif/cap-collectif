<?php
namespace Application\Migrations;

use Capco\AppBundle\Entity\SiteImage;
use Capco\ClassificationBundle\Entity\Category;
use Capco\ClassificationBundle\Entity\Context;
use Capco\MediaBundle\Entity\Media;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150202184849 extends AbstractMigration implements ContainerAwareInterface
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
    }

    public function down(Schema $schema)
    {
    }

    public function postDown(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $query = $em->createQuery(
            "SELECT si.id FROM Capco\AppBundle\Entity\SiteImage si JOIN si.Media m WHERE si.keyname = :keyname"
        );
        $query->setParameter('keyname', 'image.default_avatar');
        $siteImage = $query->getOneOrNullResult();
        if (null != $siteImage) {
            $mediaId = $siteImage['m'];
            if (null != $mediaId) {
                $this->connection->delete('media__media', array('id' => $mediaId));
            }
            $this->connection->delete('site_image', array('id' => $siteImage['id']));
        }
    }
}
