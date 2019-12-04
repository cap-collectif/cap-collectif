<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151023122045 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema): void{
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $em = $this->container->get('doctrine.orm.entity_manager');

        $date = new \DateTime();
        $created = $date->format('Y-m-d H:i:s');
        $updated = $created;

        $sections = [
            ['budget', 'Budget participatif', 12, null, '', null, true, $created, $updated, null],
        ];

        foreach ($sections as $values) {
            $query = $em->createQuery(
                "SELECT s.id FROM Capco\AppBundle\Entity\Section s WHERE s.title = :title"
            );
            $query->setParameter('title', $values[1]);
            $section = $query->getOneOrNullResult();

            if (null == $section) {
                $this->connection->executeQuery(
                    "INSERT INTO section (type, title, position, teaser, body, nb_objects, enabled, updated_at, created_at, associated_features) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    $values
                );
            }
        }
    }

    public function down(Schema $schema): void{
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $em = $this->container->get('doctrine.orm.entity_manager');

        $query = $em->createQuery(
            "DELETE FROM Capco\AppBundle\Entity\Section s WHERE s.type = :type"
        );
        $query->setParameter('type', 'budget');
    }
}
