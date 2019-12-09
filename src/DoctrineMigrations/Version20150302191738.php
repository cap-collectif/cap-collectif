<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Capco\AppBundle\Entity\SiteParameter;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150302191738 extends AbstractMigration implements ContainerAwareInterface
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

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema): void
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $date = new \DateTime();
        $created = $date->format('Y-m-d H:i:s');
        $updated = $created;

        $values = [
            'homepage.jumbotron.darken',
            "Assombrissement de l'image de fond sur la page d'accueil",
            true,
            160,
            SiteParameter::$types['boolean'],
            true,
            $created,
            $updated
        ];

        $query = $em->createQuery(
            'SELECT sp.id FROM Capco\\AppBundle\\Entity\\SiteParameter sp WHERE sp.keyname = :keyname'
        );
        $query->setParameter('keyname', $values[0]);
        $param = $query->getOneOrNullResult();

        if (null == $param) {
            $this->connection->executeQuery(
                'INSERT INTO site_parameter (keyname, title, value, position, type, is_enabled, updated_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                $values
            );
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }

    public function postDown(Schema $schema): void
    {
        $this->connection->delete('site_parameter', [
            'keyname' => 'homepage.jumbotron.darken'
        ]);
    }
}
