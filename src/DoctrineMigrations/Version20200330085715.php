<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Entity\SiteParameter;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200330085715 extends AbstractMigration implements ContainerAwareInterface
{
    protected $container;
    private $generator;
    private $em;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
        $this->em = $container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }

    public function getDescription(): string
    {
        return 'Add new siteParameter for redirectionIO';
    }

    public function up(Schema $schema): void
    {
    }

    public function postUp(Schema $schema): void
    {
        $date = (new \DateTime())->format('Y-m-d H:i:s');
        $this->connection->insert('site_parameter', [
            'id' => $this->generator->generate($this->em, null),
            'keyname' => 'redirectionio.project.id',
            'value' => '',
            'created_at' => $date,
            'updated_at' => $date,
            'is_enabled' => 1,
            'type' => SiteParameter::TYPE_SIMPLE_TEXT,
            'category' => 'pages.redirection',
            'position' => 2
        ]);
    }

    public function down(Schema $schema): void
    {
        $this->addSql("
            DELETE FROM site_parameter WHERE keyname='redirectionio.project.id'
        ");
    }
}
