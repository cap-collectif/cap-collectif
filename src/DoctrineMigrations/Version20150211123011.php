<?php

namespace Application\Migrations;

use Capco\AppBundle\Entity\SiteParameter;
use Doctrine\Migrations\AbstractMigration;
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

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema): void
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $date = (new \DateTime())->format('Y-m-d H:i:s');
        $newParameters = [
            [
                'login.text.top',
                'Texte en haut de la page de connexion',
                '',
                250,
                SiteParameter::$types['rich_text'],
                true,
                $date,
                $date
            ],
            [
                'login.text.bottom',
                'Texte en bas de la page de connexion',
                '',
                251,
                SiteParameter::$types['rich_text'],
                true,
                $date,
                $date
            ],
            [
                'signin.text.top',
                "Texte en haut de la page d'inscription",
                '',
                252,
                SiteParameter::$types['rich_text'],
                true,
                $date,
                $date
            ],
            [
                'signin.text.bottom',
                "Texte en bas de la page d'inscription",
                'Les informations recueillies font l’objet d’un traitement informatique destiné au fonctionnement de la plateforme contributive. Le [nom du propriétéaire] est l’unique destinataire de ces données. Conformément à la loi « informatique et libertés » du 6 janvier 1978 modifiée en 2004, vous bénéficiez d’un droit d’accès et de rectification aux informations qui vous concernent, que vous pouvez exercer en vous adressant à [adresse de contact]. Vous pouvez également, pour des motifs légitimes, vous opposer au traitement des données vous concernant.',
                253,
                SiteParameter::$types['rich_text'],
                true,
                $date,
                $date
            ]
        ];

        foreach ($newParameters as $values) {
            $query = $em->createQuery(
                'SELECT sp.id FROM Capco\\AppBundle\\Entity\\SiteParameter sp WHERE sp.keyname = :keyname'
            );
            $query->setParameter('keyname', $values[0]);
            $param = $query->getOneOrNullResult();
            if (null == $param) {
                $this->connection->insert('site_parameter', [
                    'keyname' => $values[0],
                    'title' => $values[1],
                    'value' => $values[2],
                    'position' => $values[3],
                    'type' => $values[4],
                    'is_enabled' => $values[5],
                    'created_at' => $values[6],
                    'updated_at' => $values[7]
                ]);
            }
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }

    public function postDown(Schema $schema): void
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $parametersKeys = [
            'login.text.top',
            'login.text.bottom',
            'signin.text.top',
            'signin.text.bottom'
        ];

        foreach ($parametersKeys as $key) {
            $query = $em->createQuery(
                'SELECT sp.id FROM Capco\\AppBundle\\Entity\\SiteParameter sp WHERE sp.keyname = :keyname'
            );
            $query->setParameter('keyname', $key);
            $param = $query->getOneOrNullResult();
            if (null != $param) {
                $this->connection->delete('site_parameter', ['id' => $param['id']]);
            }
        }
    }
}
