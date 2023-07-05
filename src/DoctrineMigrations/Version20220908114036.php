<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class Version20220908114036 extends AbstractMigration implements ContainerAwareInterface
{
    private UuidGenerator $generator;
    private EntityManagerInterface $em;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->em = $container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }

    public function getDescription(): string
    {
        return 'add section projectsMap';
    }

    public function up(Schema $schema): void
    {
    }

    public function down(Schema $schema): void
    {
    }

    public function postUp(Schema $schema): void
    {
        if (null === $this->getProjectsMapSectionId()) {
            $date = (new \DateTime())->format('Y-m-d H:i:s');
            $id = $this->generator->generate($this->em, null);
            $this->connection->insert(
                'section',
                [
                    'id' => $id,
                    'type' => 'projectsMap',
                    'position' => 14,
                    'nb_objects' => null,
                    'enabled' => 0,
                    'created_at' => $date,
                    'updated_at' => $date,
                ]
            );

            $frId = $this->generator->generate($this->em, null);
            $this->connection->insert(
                'section_translation',
                [
                    'id' => $frId,
                    'translatable_id' => $id,
                    'title' => 'Carte des projets participatifs',
                    'locale' => 'fr-FR',
                ]
            );

            $enId = $this->generator->generate($this->em, null);
            $this->connection->insert(
                'section_translation',
                [
                    'id' => $enId,
                    'translatable_id' => $id,
                    'title' => 'Participatory projects map',
                    'locale' => 'en-GB',
                ]
            );
        }
    }

    public function postDown(Schema $schema): void
    {
        $id = $this->getProjectsMapSectionId();
        if (null !== $id) {
            $this->connection->delete('section_translation', ['translatable_id' => $id]);
            $this->connection->delete('section', ['id' => $id]);
        }
    }

    private function getProjectsMapSectionId(): ?string
    {
        $id = $this->connection->fetchOne('SELECT id FROM section WHERE type="projectsMap"');
        if (false === $id) {
            return null;
        }

        return $id;
    }
}
