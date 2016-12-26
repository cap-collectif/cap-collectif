<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\ORM\Id\UuidGenerator;

class Version20161219175116 extends AbstractMigration implements ContainerAwareInterface
{
    protected $em;
    protected $idToUuidMap = [];
    protected $generator;
    protected $fkTables = [
      ['table' => 'proposal', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> false],
      ['table' => 'proposal', 'key' => 'update_author_id', 'tmpKey' => 'update_author_uuid', 'nullable'=> true],
      ['table' => 'user_favorite_proposal', 'pk'=> ['proposal_id', 'user_id'], 'key' => 'user_id', 'tmpKey'=> 'user_uuid', 'nullable'=> false],
      ['table' => 'theme', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> false],
      ['table' => 'comment', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> false],
      ['table' => 'reporting', 'key' => 'reporter_id', 'tmpKey' => 'reporter_uuid', 'nullable'=> false],
      ['table' => 'answer', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> false],
      ['table' => 'opinion', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> false],
      ['table' => 'opinion_version', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> false],
      ['table' => 'idea', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> false],
      ['table' => 'argument', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> false],
      ['table' => 'source', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> false],
      ['table' => 'reply', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> false],
      ['table' => 'project', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> false],
      ['table' => 'event', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> false],
      ['table' => 'blog_post_authors', 'pk'=> ['post_id', 'user_id'], 'key' => 'user_id', 'tmpKey' => 'user_uuid', 'nullable'=> false],
      ['table' => 'event_registration', 'key' => 'user_id', 'tmpKey' => 'user_uuid', 'nullable'=> true],
      ['table' => 'synthesis_element', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> true],
      ['table' => 'video', 'key' => 'author_id', 'tmpKey' => 'author_uuid', 'nullable'=> false],
      ['table' => 'votes', 'key' => 'voter_id', 'tmpKey' => 'voter_uuid', 'nullable'=> true],
      ['table' => 'fos_user_user_group', 'pk'=> ['group_id', 'user_id'], 'key' => 'user_id', 'tmpKey' => 'user_uuid', 'nullable'=> false],
    ];

    public function setContainer(ContainerInterface $container = null)
    {
        $this->em = $container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }

    public function up(Schema $schema)
    {
        $this->addSql('ALTER TABLE fos_user ADD uuid CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\'');
        foreach ($this->fkTables as $fk) {
            $this->addSql('ALTER TABLE '. $fk['table'] .' ADD '. $fk['tmpKey'] .' CHAR(36) '. ($fk['nullable'] ? '' : 'NOT NULL ') . 'COMMENT \'(DC2Type:guid)\'');
        }
    }

    public function generateUuids()
    {
      $users = $this->em->getRepository('CapcoUserBundle:User')->findAll();
      foreach ($users as $user) {
          echo 'Creating uuid for user ' . $user->getId() . PHP_EOL;
          $uuid = $this->generator->generate($this->em, null);
          $this->idToUuidMap[$user->getId()] = $uuid;
          $this->connection->update('fos_user', ['uuid' => $uuid], ['id' => $user->getId()]);
      }
    }

    public function addUuidToEveryTableWithFK()
    {
      echo 'Adding uuid to every table with fks...' . PHP_EOL;
      foreach ($this->fkTables as $fk) {
        $pk = isset($fk['pk']) ? implode(',', $fk['pk']) : 'id';
        $fetch = $this->connection->fetchAll('SELECT '. $pk .', '. $fk['key'] .' FROM '. $fk['table']);
        foreach ($fetch as $data) {
            if ($data[$fk['key']]) { // do nothing when null
              if (!isset($fk['pk'])) {
                $queryPk = ['id' => $data['id']];
              } else {
                $queryPk = array_flip($fk['pk']);
                foreach ($queryPk as $key => $value) {
                  $queryPk[$key] = $data[$key];
                }
              }
              $this->connection->update(
                $fk['table'],
                [ $fk['tmpKey'] => $this->idToUuidMap[ $data[$fk['key']] ] ],
                $queryPk
              );
           }
        }
      }
    }

    private function getKeyName($table, $key)
    {
      // code from AbstractAsset dbal
      $hash = implode('', array_map(function($column) {
            return dechex(crc32($column));
        }, [$table, $key]));
      return substr(strtoupper('FK' . '_' . $hash), 0, 30);
    }

    public function deleteOldFKs()
    {
      echo 'Deleting olg keys...' . PHP_EOL;
      foreach ($this->fkTables as $fk) {
        if (isset($fk['pk'])) { // if author_id is in primary key
          $this->connection->executeQuery('ALTER TABLE '. $fk['table'] .' DROP PRIMARY KEY');
        }
        $this->connection->executeQuery('ALTER TABLE '. $fk['table'] .' DROP FOREIGN KEY '. $this->getKeyName($fk['table'], $fk['key']));
        $this->connection->executeQuery('ALTER TABLE '. $fk['table'] .' DROP COLUMN '. $fk['key']);
      }
    }

    public function renameFKs()
    {
      echo 'Renaming foreign keys...' . PHP_EOL;
      foreach ($this->fkTables as $fk) {
        $this->connection->executeQuery('ALTER TABLE '. $fk['table'] .' CHANGE '. $fk['tmpKey'] . ' ' . $fk['key']. ' CHAR(36) '. ($fk['nullable'] ? '' : 'NOT NULL ') .'COMMENT \'(DC2Type:guid)\'');
      }
    }

    public function updateMainPrimaryKey()
    {
        // if this fail you probably still have a FK referencing id
        $this->connection->executeQuery('ALTER TABLE fos_user DROP PRIMARY KEY');
        $this->connection->executeQuery('ALTER TABLE fos_user DROP COLUMN id');
        $this->connection->executeQuery('ALTER TABLE fos_user CHANGE uuid id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\'');
        $this->connection->executeQuery('ALTER TABLE fos_user ADD PRIMARY KEY (id)');
    }

    public function postUp(Schema $schema)
    {
      $this->generateUuids();
      $this->addUuidToEveryTableWithFK();
      $this->deleteOldFKs();
      $this->renameFKs();
      $this->updateMainPrimaryKey();
    }

    public function down(Schema $schema)
    {
    }
}
