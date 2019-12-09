<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Capco\AppBundle\Entity\SiteParameter;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150305181845 extends AbstractMigration implements ContainerAwareInterface
{
    protected $container;

    /**
     * Sets the Container.
     *
     * @param ContainerInterface|null $container A ContainerInterface instance or null
     *
     * @api
     */
    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE comment ADD post_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE comment ADD CONSTRAINT FK_9474526C4B89032C FOREIGN KEY (post_id) REFERENCES blog_post (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_9474526C4B89032C ON comment (post_id)');
        $this->addSql(
            'ALTER TABLE blog_post ADD comments_count INT NOT NULL, ADD is_commentable TINYINT(1) NOT NULL'
        );
    }

    public function postUp(Schema $schema): void
    {
        $this->connection->delete('site_parameter', ['keyname' => 'blog.disqus.username']);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE blog_post DROP comments_count, DROP is_commentable');
        $this->addSql('ALTER TABLE comment DROP FOREIGN KEY FK_9474526C4B89032C');
        $this->addSql('DROP INDEX IDX_9474526C4B89032C ON comment');
        $this->addSql('ALTER TABLE comment DROP post_id');
    }

    public function postDown(Schema $schema): void
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        $date = new \DateTime();
        $created = $date->format('Y-m-d H:i:s');
        $updated = $created;

        $values = [
            'blog.disqus.username',
            'Compte Disqus à utiliser',
            '',
            1000,
            SiteParameter::$types['simple_text'],
            false,
            $created,
            $updated
        ];

        $query = $em->createQuery(
            'SELECT sp.id FROM Capco\\AppBundle\\Entity\\SiteParameter sp WHERE sp.keyname = :keyname'
        );
        $query->setParameter('keyname', $values[0]);
        $param = $query->getOneOrNullResult();

        if (null == $param) {
            $this->connection->executeQuery(
                'INSERT INTO site_parameter (keyname, title, value, position, type, is_enabled, updated_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                $values
            );
        }
    }
}
