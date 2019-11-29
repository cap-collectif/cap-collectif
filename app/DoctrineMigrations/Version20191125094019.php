<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20191125094019 extends AbstractMigration implements ContainerAwareInterface
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

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE blog_post_translation (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', translatable_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', abstract LONGTEXT DEFAULT NULL, slug VARCHAR(255) NOT NULL, title VARCHAR(255) NOT NULL, body LONGTEXT NOT NULL, meta_description VARCHAR(160) DEFAULT NULL, locale VARCHAR(255) NOT NULL, INDEX IDX_2C2AE4A62C2AC5D3 (translatable_id), UNIQUE INDEX blog_post_translation_unique_translation (translatable_id, locale), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE blog_post_translation ADD CONSTRAINT FK_2C2AE4A62C2AC5D3 FOREIGN KEY (translatable_id) REFERENCES blog_post (id) ON DELETE CASCADE');
        $this->addSql('DROP INDEX UNIQ_BA5AE01D989D9B62 ON blog_post');
        $this->addSql('DROP INDEX post_comment_idx ON comment');
        $this->addSql('CREATE INDEX post_comment_idx ON comment (id, post_id)');
    }

    public function postUp(Schema $schema): void
    {
        $posts = $this->connection->fetchAll("SELECT * FROM blog_post");
        foreach ($posts as $post) {
            $this->connection->insert(
                'blog_post_translation',
                [
                    'id' => $this->generator->generate($this->em, null),
                    'locale' => 'fr-FR',
                    'translatable_id' => $post['id'],
                    'title' => $post['title'],
                    'abstract' => $post['abstract'],
                    'body' => $post['body'],
                    'meta_description' => $post['meta_description'],
                    'slug' => $post['slug'],
                ]
            );
        }

        $this->connection->exec('ALTER TABLE blog_post DROP title, DROP abstract, DROP slug, DROP body, DROP meta_description');
    }


    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE blog_post_translation');
        $this->addSql('ALTER TABLE blog_post ADD title VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, ADD abstract LONGTEXT CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD slug VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, ADD body LONGTEXT CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`, ADD meta_description VARCHAR(160) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_BA5AE01D989D9B62 ON blog_post (slug)');
        $this->addSql('DROP INDEX post_comment_idx ON comment');
        $this->addSql('CREATE INDEX post_comment_idx ON comment (id)');
    }
}
