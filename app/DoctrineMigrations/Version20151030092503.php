<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151030092503 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->connection->update(
            'synthesis_element',
            ['title' => '1. Arguments pour'],
            ['title' => 'Arguments pour']
        );
        $this->connection->update(
            'synthesis_element',
            ['title' => '2. Arguments contre'],
            ['title' => 'Arguments contre']
        );
        $this->connection->update(
            'synthesis_element',
            ['title' => '3. Modifications suggérées'],
            ['title' => 'Modifications suggérées']
        );
        $this->connection->update(
            'synthesis_element',
            ['title' => '4. Points de vigilance'],
            ['title' => 'Points de vigilance']
        );
        $this->connection->update(
            'synthesis_element',
            ['title' => '5. Sources'],
            ['title' => 'Sources']
        );

        // Publish articles children that are not ignored or divided
        $articles = $this->connection->executeQuery(
            '
            SELECT se.id, se.path
            FROM synthesis_element se
            WHERE (se.linked_data_class LIKE ? OR se.linked_data_class LIKE ?)
            AND se.archived = 1 AND se.published = 1
        ',
            ["%Opinion", "%OpinionVersion"]
        );

        foreach ($articles as $a) {
            $this->connection->executeUpdate(
                '
                UPDATE synthesis_element
                SET archived = 1, published = 1
                WHERE path LIKE ?
                AND archived = 0
            ',
                [$a['path'] . "%"]
            );
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->connection->update(
            'synthesis_element',
            ['title' => 'Arguments pour'],
            ['title' => '1. Arguments pour']
        );
        $this->connection->update(
            'synthesis_element',
            ['title' => 'Arguments contre'],
            ['title' => '2. Arguments contre']
        );
        $this->connection->update(
            'synthesis_element',
            ['title' => 'Modifications suggérées'],
            ['title' => '3. Modifications suggérées']
        );
        $this->connection->update(
            'synthesis_element',
            ['title' => 'Points de vigilance'],
            ['title' => '4. Points de vigilance']
        );
        $this->connection->update(
            'synthesis_element',
            ['title' => 'Sources'],
            ['title' => '5. Sources']
        );
    }
}
