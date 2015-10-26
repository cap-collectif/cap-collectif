<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151026092229 extends AbstractMigration implements ContainerAwareInterface
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
        // Migration to fix articles 1 and 23 on republique-numerique.fr. Will be removed later on.
        $em = $this->container->get('doctrine.orm.entity_manager');
        $articlesIds = ["d3726c3f-7415-11e5-9ed9-fa163eea5cb7", "d05d62dd-7415-11e5-9ed9-fa163eea5cb7"];
        $articles = $em
            ->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')
            ->createQueryBuilder('se')
            ->where('se.id IN (:articlesIds)')
            ->setParameter('articlesIds', $articlesIds)
            ->getQuery()
            ->getResult();

        $fixParent = function ($parent) use (&$fixParent, &$em) {
            foreach ($parent->getChildren() as $child) {
                $child->setParent($parent);
                $child->setLevel($parent->getLevel() + 1);
                $child->setPath($parent->getPath().'|'.$child->getTitle().'-'.$child->getId());
                $fixParent($child);
                $em->persist($child);
            }
        };

        foreach($articles as $a) {
            $a->setParent(null);
            $a->setLevel(0);
            $a->setPath($a->getTitle().'-'.$a->getId());
            $fixParent($a);
        }

        $em->flush();

    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
