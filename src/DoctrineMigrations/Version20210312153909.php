<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210312153909 extends AbstractMigration implements ContainerAwareInterface
{
    private ?ContainerInterface $container;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema): void
    {
    }

    public function down(Schema $schema): void
    {
    }

    public function postUp(Schema $schema): void
    {
        if ('prod' !== $this->container->getParameter('kernel.environment')) {
            return;
        }
        /** @var EntityManagerInterface $em */
        $em = $this->container->get('doctrine.orm.entity_manager');
        $query = $em->createQuery(
            "SELECT sp.id FROM Capco\\AppBundle\\Entity\\SiteParameter sp WHERE sp.keyname = 'shield.introduction'"
        );
        $translationId = $query->getOneOrNullResult()['id'];

        $query = $em->createQuery(
            'SELECT spt.id FROM Capco\\AppBundle\\Entity\\SiteParameterTranslation spt WHERE spt.translatable = :translatable'
        );
        $query->setParameter(':translatable', $translationId);
        $result = $query->getArrayResult();

        if (0 === \count($result)) {
            $this->connection->insert('site_parameter_translation', [
                'id' => (new UuidGenerator())->generate(
                    $this->container->get('doctrine')->getManager(),
                    null
                ),
                'translatable_id' => $translationId,
                'locale' => 'fr-FR',
                'value' => '',
            ]);
        }
    }
}
