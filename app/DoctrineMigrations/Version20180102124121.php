<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20180102124121 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
    }

     public function postUp(Schema $schema)
     {
         $posts = $this->connection->fetchAll('SELECT * from step');
         foreach ($posts as $post) {
             $this->connection->update('step', ['label' => $post['title']], ['id' => $post['id']]);
         }
     }
}
