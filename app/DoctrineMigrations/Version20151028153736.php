<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151028153736 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $articlesPath = [
            "Article 1 - Open data par défaut (obligation de diffuser en ligne les principaux documents et données des organismes publics)-d05d62dd-7415-11e5-9ed9-fa163eea5cb7",
            "Article 23 - Développement des usages numériques dans les territoires-d3726c3f-7415-11e5-9ed9-fa163eea5cb7",
        ];
        foreach ($articlesPath as $ap) {
            $this->connection->executeUpdate(
                '
                UPDATE synthesis_element
                SET published = 1, archived = 1
                WHERE path LIKE ?
                AND division_id IS NULL
            ',
                [$ap . '%']
            );
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
