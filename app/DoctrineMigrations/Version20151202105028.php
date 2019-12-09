<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151202105028 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // Fix issues with some site parameters
        $params = [
            'members.pagination.size',
            'members.jumbotron.body',
            'members.jumbotron.title',
            'members.content.body',
        ];

        foreach ($params as $param) {
            $this->connection->update(
                'site_parameter',
                ['category' => 'pages.members'],
                ['keyname' => $param]
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
