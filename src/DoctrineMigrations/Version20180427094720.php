<?php

namespace Application\Migrations;

use Capco\AppBundle\Toggle\Manager;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class Version20180427094720 extends AbstractMigration implements ContainerAwareInterface
{
    protected $container;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema): void
    {
        $this->container->get(Manager::class)->activate('indexation');
    }

    public function down(Schema $schema): void
    {
    }
}
