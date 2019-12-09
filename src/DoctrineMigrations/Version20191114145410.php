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
final class Version20191114145410 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;
    private $em;
    private $generator;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
        $this->em = $this->container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $schemaManager = $this->connection->getSchemaManager();
        if (!$schemaManager->tablesExist('theme_translation')) {
            $this->addSql(
                'CREATE TABLE theme_translation (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', translatable_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', teaser VARCHAR(255) DEFAULT NULL, slug VARCHAR(255) NOT NULL, title VARCHAR(255) NOT NULL, body LONGTEXT DEFAULT NULL, meta_description VARCHAR(160) DEFAULT NULL, locale VARCHAR(255) NOT NULL, INDEX IDX_5C4256602C2AC5D3 (translatable_id), UNIQUE INDEX theme_translation_unique_translation (translatable_id, locale), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
            );
            $this->addSql(
                'ALTER TABLE theme_translation ADD CONSTRAINT FK_5C4256602C2AC5D3 FOREIGN KEY (translatable_id) REFERENCES theme (id) ON DELETE CASCADE'
            );
            $this->addSql('DROP INDEX UNIQ_9775E708989D9B62 ON theme');
        } else {
            $this->addSql('ALTER TABLE theme_translation CHANGE body body LONGTEXT DEFAULT NULL');
        }
    }

    public function postUp(Schema $schema): void
    {
        $themes = $this->connection->fetchAll('SELECT * FROM theme');
        $locale = $this->connection->fetchAssoc(
            'SELECT * FROM site_parameter WHERE keyname = "global.locale"'
        )['value'];

        foreach ($themes as $theme) {
            $this->connection->insert('theme_translation', [
                'id' => $this->generator->generate($this->em, null),
                'locale' => $locale,
                'translatable_id' => $theme['id'],
                'title' => $theme['title'],
                'slug' => $theme['slug'],
                'teaser' => $theme['teaser'],
                'body' => $theme['body'],
                'meta_description' => $theme['meta_description']
            ]);
        }

        $this->connection->exec(
            'ALTER TABLE theme DROP title, DROP slug, DROP teaser, DROP body, DROP meta_description'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE theme_translation');
        $this->addSql(
            'ALTER TABLE theme ADD title VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, ADD slug VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, ADD teaser VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD body LONGTEXT CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD meta_description VARCHAR(160) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`'
        );
        $this->addSql('CREATE UNIQUE INDEX UNIQ_9775E708989D9B62 ON theme (slug)');
    }
}
