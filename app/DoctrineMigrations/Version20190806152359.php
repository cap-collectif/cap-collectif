<?php declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Repository\ConsultationRepository;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\EntityManager;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190806152359 extends AbstractMigration implements ContainerAwareInterface
{

    /**
     * @var ContainerInterface $container
     */
    private $container;

    public function postUp(Schema $schema)
    {
        echo "-> Adding consultations slug...\n";
        $em = $this->container->get('doctrine.orm.entity_manager');
        $consultations = $em->getRepository('CapcoAppBundle:Consultation')->findAll();

        foreach ($consultations as $consultation) {
            $consultation->setSlug(null); // Allows Gedmo to regenerate itself the slugs
        }
        $em->flush();
        echo "-> Finished adding consultations slug\n";
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE consultation ADD slug VARCHAR(255) NOT NULL');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE consultation DROP slug');
    }

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }
}
