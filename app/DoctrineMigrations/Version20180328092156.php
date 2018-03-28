<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180328092156 extends AbstractMigration
{

    protected $siteParamer = [
        'keyname' => 'charter.body',
        'category' => 'pages.charter',
        'position' => 1,
        'type' => 1,
        'is_enabled' => true
    ];

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs

    }

    public function postUp(Schema $schema)
    {
        $request = $this->connection->fetchAll('SELECT body FROM page WHERE id = 1', ['']);
        $this->siteParamer['value'] = $request[0]['body'];

        $this->connection->insert('site_parameter', $this->siteParamer);
        $this->write('-> new site parameter');

        $this->connection->delete('page', ['id' => 1]);
        $this->write('-> delete charte page');

    }

    public function postDown(Schema $schema)
    {

    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs

    }
}
