<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170802100000 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $proposals = $this->connection->fetchAll(
            'SELECT id, address FROM proposal WHERE address IS NOT NULL'
        );

        foreach ($proposals as $proposal) {
            if (0 === strpos($proposal['address'], '"')) {
                $newAddressField = stripslashes(trim($proposal['address'], '"'));
                $query = $this->connection->prepare('UPDATE proposal SET address = ? WHERE id = ?');
                $query->bindParam(1, $newAddressField);
                $query->bindParam(2, $proposal['id']);
                $query->execute();
            }

            if (
                $proposal['address'] === '""' ||
                $proposal['address'] === 'null' ||
                $proposal['address'] === ''
            ) {
                $newAddressField = null;
                $query = $this->connection->prepare('UPDATE proposal SET address = ? WHERE id = ?');
                $query->bindParam(1, $newAddressField);
                $query->bindParam(2, $proposal['id']);
                $query->execute();
            }
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );
    }
}
