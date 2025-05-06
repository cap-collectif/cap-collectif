<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Entity\SiteParameter;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class Version20210927143921 extends AbstractMigration implements ContainerAwareInterface
{
    protected $container;
    private $generator;
    private $em;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->container = $container;
        $this->em = $container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }

    public function getDescription(): string
    {
        return 'Add new siteParameter for HotJar';
    }

    public function up(Schema $schema): void
    {
    }

    public function postUp(Schema $schema): void
    {
        $date = (new \DateTime())->format('Y-m-d H:i:s');
        $this->connection->insert('site_parameter', [
            'id' => $this->generator->generate($this->em, null),
            'keyname' => 'admin.analytics.hotjarid',
            'value' => null,
            'created_at' => $date,
            'updated_at' => $date,
            'is_enabled' => 1,
            'type' => SiteParameter::TYPE_SIMPLE_TEXT,
            'category' => 'settings.global',
            'position' => 10,
        ]);
    }

    public function down(Schema $schema): void
    {
        $this->addSql("
            DELETE FROM site_parameter WHERE keyname='admin.analytics.hotjarid'
        ");
    }
}
