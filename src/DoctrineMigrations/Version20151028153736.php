<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151028153736 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $articlesPath = [
            'Article 1 - Open data par défaut (obligation de diffuser en ligne les principaux documents et données des organismes publics)-d05d62dd-7415-11e5-9ed9-fa163eea5cb7',
            'Article 23 - Développement des usages numériques dans les territoires-d3726c3f-7415-11e5-9ed9-fa163eea5cb7',
        ];
        foreach ($articlesPath as $ap) {
            $this->connection->executeStatement(
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

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
