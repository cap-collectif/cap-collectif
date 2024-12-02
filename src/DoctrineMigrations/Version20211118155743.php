<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20211118155743 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema): void
    {
        $fbUsers = $this->connection->fetchAllAssociative(
            'select id, email, email_canonical from fos_user where facebook_id IS NOT NULL'
        );
        foreach ($fbUsers as $user) {
            if (!str_contains((string) $user['email'], 'twitter_')) {
                continue;
            }
            $email = str_replace('twitter', 'facebook', (string) $user['email']);
            $this->connection->update(
                'fos_user',
                ['email' => $email, 'email_canonical' => $email],
                ['id' => $user['id']]
            );
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
