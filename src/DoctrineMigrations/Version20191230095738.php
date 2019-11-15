<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20191230095738 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;
    private $em;
    private $generator;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
        $this->em = $container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE source ADD CONSTRAINT FK_5F8A7F732E39CD42 FOREIGN KEY (source_category_id) REFERENCES source_category (id)'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE source DROP FOREIGN KEY FK_5F8A7F732E39CD42');
    }

    public function postUp(Schema $schema): void
    {
        $sourceCategories = $this->connection->fetchAll('SELECT * FROM source_category');
        foreach ($sourceCategories as $sourceCategory) {
            $this->connection->insert('source_category_translation', [
                'id' => $this->generator->generate($this->em, null),
                'locale' => 'fr-FR',
                'translatable_id' => $sourceCategory['id'],
                'title' => $sourceCategory['title'],
                'slug' => $sourceCategory['slug']
            ]);
        }

        $this->connection->exec('ALTER TABLE source_category DROP title, DROP slug');
    }
}
