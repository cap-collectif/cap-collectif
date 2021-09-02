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
final class Version20200106104137 extends AbstractMigration implements ContainerAwareInterface
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
        $this->addSql(
            'CREATE TABLE source_category_translation (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', translatable_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', slug VARCHAR(255) NOT NULL, title VARCHAR(255) NOT NULL, locale VARCHAR(255) NOT NULL, INDEX IDX_DBE8113A2C2AC5D3 (translatable_id), UNIQUE INDEX source_category_translation_unique_translation (translatable_id, locale), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE source_category_translation ADD CONSTRAINT FK_DBE8113A2C2AC5D3 FOREIGN KEY (translatable_id) REFERENCES source_category (id) ON DELETE CASCADE'
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
        $this->addSql(
            'ALTER TABLE source_category_translation DROP FOREIGN KEY FK_DBE8113A2C2AC5D3'
        );
        $this->addSql(
            'CREATE TABLE category (id CHAR(36) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\', title VARCHAR(100) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, slug VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, isEnabled TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE `utf8_unicode_ci` ENGINE = InnoDB COMMENT = \'\' '
        );
        $this->addSql('DROP TABLE source_category');
        $this->addSql('DROP TABLE source_category_translation');
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
                'slug' => $sourceCategory['slug'],
            ]);
        }

        $this->connection->exec('ALTER TABLE source_category DROP title, DROP slug');
    }
}
