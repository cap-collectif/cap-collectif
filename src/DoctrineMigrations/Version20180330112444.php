<?php

namespace Application\Migrations;

use Capco\AppBundle\Entity\Interfaces\FollowerNotifiedOfInterface;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180330112444 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE user_following_proposal ADD notified_of VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE selection ADD created_at DATETIME NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE selection DROP created_at');
        $this->addSql('ALTER TABLE user_following_proposal DROP notified_of');
    }

    public function postUp(Schema $schema): void
    {
        $followers = $this->connection->fetchAllAssociative(
            'SELECT id from user_following_proposal'
        );
        foreach ($followers as $follower) {
            $this->connection->update(
                'user_following_proposal',
                ['notified_of' => FollowerNotifiedOfInterface::ALL],
                ['id' => $follower['id']]
            );
        }

        $proposals = $this->connection->fetchAllAssociative(
            'SELECT id, created_at, author_id from proposal'
        );
        foreach ($proposals as $proposal) {
            $this->connection->update(
                'user_following_proposal',
                ['notified_of' => FollowerNotifiedOfInterface::ALL],
                ['user_id' => $proposal['author_id'], 'proposal_id' => $proposal['id']]
            );
        }
    }
}
