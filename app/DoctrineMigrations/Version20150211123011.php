<?php

namespace Application\Migrations;

use Capco\AppBundle\Entity\SiteParameter;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150211123011 extends AbstractMigration implements ContainerAwareInterface
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
        $em = $this->container->get('doctrine.orm.entity_manager');

        $newParameters = array(
            array(
                'login.text.top',
                'Texte en haut de la page de connexion',
                '',
                250,
                SiteParameter::$types['rich_text'],
                true
            ),
            array(
                'login.text.bottom',
                'Texte en bas de la page de connexion',
                '',
                251,
                SiteParameter::$types['rich_text'],
                true
            ),
            array(
                'signin.text.top',
                "Texte en haut de la page d'inscription",
                '',
                252,
                SiteParameter::$types['rich_text'],
                true
            ),
            array(
                'signin.text.bottom',
                "Texte en bas de la page d'inscription",
                'Les informations recueillies font l’objet d’un traitement informatique destiné au fonctionnement de la plateforme contributive. Le [nom du propriétéaire] est l’unique destinataire de ces données. Conformément à la loi « informatique et libertés » du 6 janvier 1978 modifiée en 2004, vous bénéficiez d’un droit d’accès et de rectification aux informations qui vous concernent, que vous pouvez exercer en vous adressant à [adresse de contact]. Vous pouvez également, pour des motifs légitimes, vous opposer au traitement des données vous concernant.',
                253,
                SiteParameter::$types['rich_text'],
                true
            )
        );

        foreach ($newParameters as $values) {
            $param = new SiteParameter();
            $param->setKeyname($values[0]);
            $param->setTitle($values[1]);
            $param->setValue($values[2]);
            $param->setPosition($values[3]);
            $param->setType($values[4]);
            $param->setIsEnabled($values[5]);
            $em->persist($param);
        }

        $em->flush();

    }

    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }

    public function postDown(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $parametersKeys = array(
            'login.text.top',
            'login.text.bottom',
            'signin.text.top',
            'signin.text.bottom',
        );

        foreach ($parametersKeys as $key) {
            $param = $em->getRepository('CapcoAppBundle:SiteParameter')->findOneByKeyname($key);
            if (null != $param) {
                $em->remove($param);
            }
        }

        $em->flush();

    }
}
