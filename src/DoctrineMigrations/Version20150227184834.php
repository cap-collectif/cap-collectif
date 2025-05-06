<?php

namespace Application\Migrations;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Toggle\Manager;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150227184834 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    /**
     * Sets the Container.
     *
     * @param null|ContainerInterface $container A ContainerInterface instance or null
     *
     * @api
     */
    public function setContainer(?ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema): void
    {
        $toggleManager = $this->container->get(Manager::class);
        $toggleManager->deactivate('shield_mode');

        $em = $this->container->get('doctrine.orm.entity_manager');

        $date = new \DateTime();
        $created = $date->format('Y-m-d H:i:s');
        $updated = $created;

        $newParameters = [
            [
                'security.shield_mode.username',
                "Nom d'utilisateur du mode bouclier",
                'admin',
                1000,
                SiteParameter::$types['simple_text'],
                true,
                $created,
                $updated,
            ],
            [
                'security.shield_mode.password',
                'Mot de passe du mode bouclier',
                'admin',
                1001,
                SiteParameter::$types['simple_text'],
                true,
                $created,
                $updated,
            ],
        ];

        foreach ($newParameters as $values) {
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
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }

    public function postDown(Schema $schema): void
    {
        $newParameters = ['security.shield_mode.username', 'security.shield_mode.password'];

        foreach ($newParameters as $key) {
            $this->connection->delete('site_parameter', ['keyname' => $key]);
        }
    }
}
