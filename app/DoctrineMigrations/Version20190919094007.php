<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190919094007 extends AbstractMigration implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE source ADD moderation_token VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE comment ADD moderation_token VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE proposal ADD moderation_token VARCHAR(255) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE comment DROP moderation_token');
        $this->addSql('ALTER TABLE proposal DROP moderation_token');
        $this->addSql('ALTER TABLE source DROP moderation_token');
    }

    public function postUp(Schema $schema)
    {
        $this->write('-> Adding moderation token for existing source...');
        $sources = $this->connection->fetchAll('SELECT id from source');
        foreach ($sources as $source) {
            $token = $this->container->get('fos_user.util.token_generator')->generateToken();
            $this->connection->update(
                'source',
                ['moderation_token' => $token],
                ['id' => $source['id']]
            );
        }

        $this->write('-> Adding moderation token for existing comment...');
        $comments = $this->connection->fetchAll('SELECT id from comment');
        foreach ($comments as $comment) {
            $token = $this->container->get('fos_user.util.token_generator')->generateToken();
            $this->connection->update(
                'comment',
                ['moderation_token' => $token],
                ['id' => $comment['id']]
            );
        }

        $this->write('-> Adding moderation token for existing proposal...');
        $proposals = $this->connection->fetchAll('SELECT id from proposal');
        foreach ($proposals as $proposal) {
            $token = $this->container->get('fos_user.util.token_generator')->generateToken();
            $this->connection->update(
                'proposal',
                ['moderation_token' => $token],
                ['id' => $proposal['id']]
            );
        }
    }
}
