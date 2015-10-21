<?php

namespace Application\Migrations;

use Capco\AppBundle\Toggle\Manager;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151019174230 extends AbstractMigration implements ContainerAwareInterface
{

    private $container;
    private $siteParameters;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function preUp(Schema $schema)
    {
        $this->siteParameters = $this->connection->fetchAll('SELECT * FROM site_parameters');
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE opinion DROP FOREIGN KEY FK_AB02B027ADA40271');
        $this->addSql('ALTER TABLE opinion ADD CONSTRAINT FK_AB02B027ADA40271 FOREIGN KEY (link_id) REFERENCES opinion (id) ON DELETE SET NULL');

        $manager = $this->container->get('capco.toggle.manager');
        $manager->isActive('consultations_form') ? $manager->activate('projects_form') : $manager->deactivate('projects_form');
        $manager->isActive('consultation_trash') ? $manager->activate('project_trash') : $manager->deactivate('project_trash');
    }

    public function postUp(Schema $schema)
    {
        foreach ($this->siteParameters as $sp) {
            $this->connection->insert('site_parameter', [
                'projects.jumbotron.title' => $sp['consultations.jumbotron.title'],
                'projects.jumbotron.body'  => $sp['consultations.jumbotron.body'],
                'projects.content.body'    => $sp['consultations.content.body'],
            ]);
        }
    }

    public function preDown(Schema $schema)
    {
        $this->siteParameters = $this->connection->fetchAll('SELECT * FROM site_parameters');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE opinion DROP FOREIGN KEY FK_AB02B027ADA40271');
        $this->addSql('ALTER TABLE opinion ADD CONSTRAINT FK_AB02B027ADA40271 FOREIGN KEY (link_id) REFERENCES opinion (id)');

        $manager = $this->container->get('capco.toggle.manager');
        $manager->isActive('projects_form') ? $manager->activate('consultations_form') : $manager->deactivate('consultations_form');
        $manager->isActive('project_trash') ? $manager->activate('consultation_trash') : $manager->deactivate('consultation_trash');
    }

    public function postDown(Schema $schema)
    {
        foreach ($this->siteParameters as $sp) {
            $this->connection->insert('site_parameter', [
                'consultations.jumbotron.title' => $sp['projects.jumbotron.title'],
                'consultations.jumbotron.body'  => $sp['projects.jumbotron.body'],
                'consultations.content.body'    => $sp['projects.content.body'],
            ]);
        }
    }
}
