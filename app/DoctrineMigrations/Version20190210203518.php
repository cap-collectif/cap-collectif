<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Capco\AppBundle\Toggle\Manager;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190210203518 extends AbstractMigration implements ContainerAwareInterface
{
    protected $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema): void
    {
        $this->container->get(Manager::class)->activate('consent_internal_communication');
    }

    public function down(Schema $schema): void
    {
    }
}
