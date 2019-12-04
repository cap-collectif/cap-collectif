<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150916123729 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void{
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema): void
    {
        // $em = $this->container->get('doctrine.orm.entity_manager');
        // $repo = $em->getRepository('CapcoAppBundle:OpinionType');
        // $opinionTypes = $repo->findAll();
        // foreach ($opinionTypes as $ot) {
        //     if ($ot->getRoot() === null && $ot->getParent() === null) {
        //         $this->connection->update('opinion_type', ['root' => $ot->getId()], ['id' => $ot->getId()]);
        //     }
        // }
        // $repo->verify();
        // $repo->recover();
        // $em->flush();
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
