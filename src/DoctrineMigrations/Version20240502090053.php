<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class Version20240502090053 extends AbstractMigration implements ContainerAwareInterface
{
    private EntityManagerInterface $em;
    private UuidGenerator $uuidGenerator;

    public function getDescription(): string
    {
        return 'add need help menu item';
    }

    public function up(Schema $schema): void
    {
    }

    public function down(Schema $schema): void
    {
    }

    public function postUp(Schema $schema): void
    {
        $this->connection->insert('menu_item', [
            'parent_id' => null,
            'is_enabled' => 1,
            'is_deletable' => 0,
            'is_fully_modifiable' => 1,
            'position' => 1,
            'created_at' => (new \DateTime())->format('Y-m-d H:i:s'),
            'updated_at' => (new \DateTime())->format('Y-m-d H:i:s'),
            'menu' => 2,
            'associated_features' => null,
            'Page_id' => null,
        ]);

        $menuItemId = $this->connection->lastInsertId();

        $menuItemTranslationId = $this->uuidGenerator->generate($this->em, null);
        $this->connection->insert('menu_item_translation', [
            'id' => $menuItemTranslationId,
            'translatable_id' => $menuItemId,
            'title' => 'Besoin d\'aide ?',
            'link' => 'https://aide-utilisateurs.helpscoutdocs.com',
            'locale' => 'fr-FR',
        ]);
    }

    public function setContainer(?ContainerInterface $container = null): void
    {
        $this->em = $container->get('doctrine')->getManager();
        $this->uuidGenerator = new UuidGenerator();
    }
}
