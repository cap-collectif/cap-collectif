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
final class Version20200106102850 extends AbstractMigration implements ContainerAwareInterface
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
            'CREATE TABLE video_translation (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', translatable_id INT DEFAULT NULL, slug VARCHAR(255) NOT NULL, title VARCHAR(255) NOT NULL, body LONGTEXT NOT NULL, locale VARCHAR(255) NOT NULL, INDEX IDX_96EBF4CE2C2AC5D3 (translatable_id), UNIQUE INDEX video_translation_unique_translation (translatable_id, locale), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE video_translation ADD CONSTRAINT FK_96EBF4CE2C2AC5D3 FOREIGN KEY (translatable_id) REFERENCES video (id) ON DELETE CASCADE'
        );
    }

    public function postUp(Schema $schema): void
    {
        $videos = $this->connection->fetchAll('SELECT * FROM video');
        foreach ($videos as $video) {
            $this->connection->insert('video_translation', [
                'id' => $this->generator->generate($this->em, null),
                'locale' => 'fr-FR',
                'translatable_id' => $video['id'],
                'title' => $video['title'] ?? 'Sans titre',
                'slug' => $video['slug'] ?? 'sans-titre',
                'body' => $video['body'] ?? 'No body'
            ]);
        }

        $this->connection->exec('ALTER TABLE video DROP title, DROP slug, DROP body');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE video_translation');
        $this->addSql(
            'ALTER TABLE video ADD title VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD slug VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD body LONGTEXT CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`'
        );
    }
}
