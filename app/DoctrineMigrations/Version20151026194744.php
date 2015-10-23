<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151026194744 extends AbstractMigration implements ContainerAwareInterface
{
    protected $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE synthesis_element ADD subtitle VARCHAR(255) DEFAULT NULL, ADD total_children_count INT NOT NULL, ADD linked_data_url VARCHAR(255) DEFAULT NULL');
    }

    public function postUp(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');
        $elements = $em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->findAll();
        foreach ($elements as $el) {
            $contribution = $em->getRepository($el->getLinkedDataClass())->find($el->getLinkedDataId());
            $urlResolver = $this->container->get('capco.url.resolver');
            $em->setLinkedDataUrl($urlResolver->getObjectUrl($contribution));
            if ($contribution instanceof \Capco\AppBundle\Entity\OpinionType) {
                $urlResolver->setSubtitle($contribution->getSubTitle());
                $childrenCount = $em
                    ->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')
                    ->childCount($el)
                ;
                $el->setTotalChildrenCount($childrenCount);
            }

        }
        $em->flush();
    }


    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE synthesis_element DROP subtitle, DROP total_children_count, DROP linked_data_url');
    }
}
