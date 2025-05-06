<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20221012154405 extends AbstractMigration implements ContainerAwareInterface
{
    private EntityManagerInterface $em;
    private UuidGenerator $generator;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->em = $container->get('doctrine')->getManager();
        $this->connection = $this->em->getConnection();
        $this->generator = new UuidGenerator();
    }

    public function getDescription(): string
    {
        return 'add uuid to blog_post_authors and add id as primary key';
    }

    public function postUp(Schema $schema): void
    {
        $table = 'blog_post_authors';
        $rows = $this->connection->fetchAllAssociative('SELECT post_id, user_id from ' . $table);
        if (\count($rows) > 0) {
            $this->write('-> Generating ' . \count($rows) . ' UUID(s)...');
            foreach ($rows as $row) {
                $postId = $row['post_id'];
                $userId = $row['user_id'];
                $uuid = $this->generator->generate($this->em, null);
                $this->connection->update(
                    $table,
                    ['id' => $uuid],
                    ['post_id' => $postId, 'user_id' => $userId]
                );
            }
        }
        $this->connection->executeQuery('ALTER TABLE blog_post_authors ADD PRIMARY KEY (id)');
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
