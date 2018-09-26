<?php
namespace Application\Migrations;

use Capco\AppBundle\Toggle\Manager;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151022093708 extends AbstractMigration implements ContainerAwareInterface
{
    protected $parameters = [
        'consultations.jumbotron.title' => 'projects.jumbotron.title',
        'consultations.jumbotron.body' => 'projects.jumbotron.body',
        'consultations.content.body' => 'projects.content.body',
    ];
    private $container;
    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        foreach ($this->parameters as $oldKey => $newKey) {
            $this->connection->update(
                'site_parameter',
                ['keyname' => $newKey],
                ['keyname' => $oldKey]
            );
        }
        $manager = $this->container->get(Manager::class);
        $manager->isActive('consultations_form')
            ? $manager->activate('projects_form')
            : $manager->deactivate('projects_form');
        $manager->isActive('consultation_trash')
            ? $manager->activate('project_trash')
            : $manager->deactivate('project_trash');
    }
    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $manager = $this->container->get(Manager::class);
        $manager->isActive('projects_form')
            ? $manager->activate('consultations_form')
            : $manager->deactivate('consultations_form');
        $manager->isActive('project_trash')
            ? $manager->activate('consultation_trash')
            : $manager->deactivate('consultation_trash');
        foreach ($this->parameters as $newKey => $oldKey) {
            $this->connection->update(
                'site_parameter',
                ['keyname' => $newKey],
                ['keyname' => $oldKey]
            );
        }
    }
}
