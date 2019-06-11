<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\UserBundle\Entity\User;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190604231806 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE fos_user ADD website_url VARCHAR(255) DEFAULT NULL');
    }

    public function postUp(Schema $schema): void
    {
        $table = 'fos_user';
        /** @var User[] $users */
        $users = $this->connection->fetchAll(
            "SELECT id, website FROM ${table} WHERE website IS NOT NULL"
        );
        foreach ($users as $user) {
            echo 'Updating website_url for user : ' . $user['id'] . PHP_EOL;
            $this->connection->update(
                $table,
                [
                    'website_url' => $user['website'],
                    'website' => null,
                ],
                ['id' => $user['id']]
            );
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE fos_user DROP website_url');
    }
}
