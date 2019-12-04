<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150303192637 extends AbstractMigration implements ContainerAwareInterface
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

        $query = $em->createQuery(
            "SELECT co.id FROM Capco\ClassificationBundle\Entity\Context co WHERE co.id = :id"
        );
        $query->setParameter('id', 'sources');
        $context = $query->getOneOrNullResult();

        if (null == $context) {
            $date = (new \DateTime())->format('Y-m-d H:i:s');
            $this->connection->insert('classification__context', array(
                'id' => 'sources',
                'name' => 'sources',
                'enabled' => 1,
                'created_at' => $date,
                'updated_at' => $date,
            ));
        }

        $query = $em->createQuery(
            "SELECT ca.id FROM Capco\ClassificationBundle\Entity\Category ca WHERE ca.name = :name"
        );
        $query->setParameter('name', 'sources');
        $category = $query->getOneOrNullResult();

        if (null == $category) {
            $date = (new \DateTime())->format('Y-m-d H:i:s');
            $this->connection->insert('classification__category', array(
                'context' => 'sources',
                'name' => 'sources',
                'slug' => 'sources',
                'enabled' => 1,
                'created_at' => $date,
                'updated_at' => $date,
            ));
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }

    public function postDown(Schema $schema): void
    {
        $this->connection->delete('classification__category', array('name' => 'sources'));
        $this->connection->delete('classification__context', array('id' => 'sources'));
    }
}
