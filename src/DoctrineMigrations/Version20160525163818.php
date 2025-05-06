<?php

namespace Application\Migrations;

use Capco\AppBundle\Toggle\Manager;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160525163818 extends AbstractMigration implements ContainerAwareInterface
{
    protected $container;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema): void
    {
        $this->container->get(Manager::class)->activate('server_side_rendering');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
