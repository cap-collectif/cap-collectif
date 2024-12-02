<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Toggle\Manager;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class Version20201216122444 extends AbstractMigration implements ContainerAwareInterface
{
    private ?ContainerInterface $container = null;
    private Manager $manager;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->container = $container;
        $this->manager = $this->container->get(Manager::class);
    }

    public function up(Schema $schema): void
    {
    }

    public function down(Schema $schema): void
    {
    }

    public function postUp(Schema $schema): void
    {
        $this->manager->getToggleManager()->remove('user_invitations');
    }

    public function postDown(Schema $schema): void
    {
    }
}
