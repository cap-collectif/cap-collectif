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
final class Version20191105174035 extends AbstractMigration implements ContainerAwareInterface
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
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE page_translation (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', translatable_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', title VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, body LONGTEXT NOT NULL, meta_description VARCHAR(160) DEFAULT NULL, locale VARCHAR(255) NOT NULL, INDEX IDX_A3D51B1D2C2AC5D3 (translatable_id), UNIQUE INDEX page_translation_unique_translation (translatable_id, locale), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE UTF8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE page_translation ADD CONSTRAINT FK_A3D51B1D2C2AC5D3 FOREIGN KEY (translatable_id) REFERENCES page (id) ON DELETE CASCADE'
        );
    }

    public function postUp(Schema $schema): void
    {
        $pages = $this->connection->fetchAll('SELECT * FROM page');
        $locale = $this->connection->fetchAssoc(
            'SELECT * FROM site_parameter WHERE keyname = "global.locale"'
        )['value'];

        foreach ($pages as $page) {
            $this->connection->insert('page_translation', [
                'id' => $this->generator->generate($this->em, null),
                'locale' => $locale,
                'translatable_id' => $page['id'],
                'title' => $page['title'],
                'slug' => $page['slug'],
                'body' => $page['body'],
                'meta_description' => $page['meta_description']
            ]);
        }

        $this->connection->exec(
            'ALTER TABLE page DROP title, DROP slug, DROP body, DROP meta_description'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE page_translation');
        $this->addSql(
            'ALTER TABLE page ADD title VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci, ADD slug VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci, ADD body LONGTEXT NOT NULL COLLATE utf8_unicode_ci, ADD meta_description VARCHAR(160) DEFAULT NULL COLLATE utf8_unicode_ci, CHANGE id id INT AUTO_INCREMENT NOT NULL'
        );
    }
}
