<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\ORM\Id\UuidGenerator;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190623155205 extends AbstractMigration implements ContainerAwareInterface
{
    private $generator;
    private $em;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->em = $container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }

    public function postUp(Schema $schema): void
    {
        foreach ($this->project_authors as $pa) {
            if ($pa['author_id']) {
                $this->connection->insert('project_author', [
                    'id' => $this->generator->generate($this->em, null),
                    'user_id' => $pa['author_id'],
                    'project_id' => $pa['id'],
                    'created_at' => $pa['created_at']
                ]);
            }
        }
    }

    public function up(Schema $schema): void
    {
        $this->project_authors = $this->connection->fetchAll(
            '
            SELECT p.author_id, p.id, p.created_at
            FROM project p
            '
        );

        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE project_author (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', user_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', project_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', created_at DATETIME NOT NULL, INDEX IDX_AA0B3382A76ED395 (user_id), INDEX IDX_AA0B3382166D1F9C (project_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE UTF8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE project_author ADD CONSTRAINT FK_AA0B3382A76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE project_author ADD CONSTRAINT FK_AA0B3382166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE project DROP FOREIGN KEY FK_2FB3D0EEF675F31B');
        $this->addSql('DROP INDEX IDX_2FB3D0EEF675F31B ON project');
        $this->addSql('ALTER TABLE project DROP author_id');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE project_author');
        $this->addSql(
            'ALTER TABLE project ADD author_id CHAR(36) DEFAULT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE project ADD CONSTRAINT FK_2FB3D0EEF675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_2FB3D0EEF675F31B ON project (author_id)');
    }
}
