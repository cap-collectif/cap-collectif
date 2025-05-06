<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Toggle\Manager;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class Version20220125142127 extends AbstractMigration implements ContainerAwareInterface
{
    private Manager $manager;
    private EntityManagerInterface $em;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->manager = $container->get(Manager::class);
        $this->em = $container->get('doctrine')->getManager();
    }

    public function getDescription(): string
    {
        return 'sso_configuration.cas_*';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE sso_configuration ADD cas_version INT DEFAULT NULL, ADD cas_server_url LONGTEXT DEFAULT NULL, ADD cas_certificate_file LONGTEXT DEFAULT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE sso_configuration DROP cas_version, DROP cas_server_url, DROP cas_certificate_file'
        );
    }
}
