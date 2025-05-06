<?php

namespace Application\Migrations;

use Capco\AppBundle\Toggle\Manager;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class Version20170613093358 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema): void
    {
    }

    public function postUp(Schema $schema): void
    {
        $toggleManager = $this->container->get(Manager::class);
        $toggleManager->activate('captcha');
    }

    public function down(Schema $schema): void
    {
    }
}
