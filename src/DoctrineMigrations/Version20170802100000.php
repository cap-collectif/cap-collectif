<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170802100000 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $proposals = $this->connection->fetchAllAssociative(
            'SELECT id, address FROM proposal WHERE address IS NOT NULL'
        );

        foreach ($proposals as $proposal) {
            if (str_starts_with((string) $proposal['address'], '"')) {
                $newAddressField = stripslashes(trim((string) $proposal['address'], '"'));
                $query = $this->connection->prepare('UPDATE proposal SET address = ? WHERE id = ?');
                $query->bindParam(1, $newAddressField);
                $query->bindParam(2, $proposal['id']);
                $query->execute();
            }

            if (
                '""' === $proposal['address']
                || 'null' === $proposal['address']
                || '' === $proposal['address']
            ) {
                $newAddressField = null;
                $query = $this->connection->prepare('UPDATE proposal SET address = ? WHERE id = ?');
                $query->bindParam(1, $newAddressField);
                $query->bindParam(2, $proposal['id']);
                $query->execute();
            }
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
    }
}
