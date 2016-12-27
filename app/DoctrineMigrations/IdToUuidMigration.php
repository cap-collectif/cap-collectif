<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\ORM\Id\UuidGenerator;

abstract class IdToUuidMigration extends AbstractMigration implements ContainerAwareInterface
{
    protected $em;
    protected $idToUuidMap = [];
    protected $generator;
    protected $table = ''; // set this
    protected $fkTables = []; // set this

    public function setContainer(ContainerInterface $container)
    {
        $this->em = $container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }

    public function up(Schema $schema)
    {
        $this->addSql('ALTER TABLE ' . $this->table .' ADD uuid CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\'');
        foreach ($this->fkTables as $fk) {
            $this->addSql('ALTER TABLE '. $fk['table'] .' ADD '. $fk['tmpKey'] .' CHAR(36) '. ($fk['nullable'] ? '' : 'NOT NULL ') . 'COMMENT \'(DC2Type:guid)\'');
        }
    }

    public function generateUuidsToReplaceIds()
    {
      $fetchs = $this->connection->fetchAll('SELECT id from ' . $this->table);
      foreach ($fetchs as $fetch) {
          $this->write('Creating uuid for id: ' . $fetch['id']);
          $uuid = $this->generator->generate($this->em, null);
          $this->idToUuidMap[$user->getId()] = $uuid;
          $this->connection->update($this->table, ['uuid' => $uuid], ['id' => $fetch['id']]);
      }
    }

    public function addThoseUuidsToTablesWithFK()
    {
      echo 'Adding uuid to every table with fks...' . PHP_EOL;
      foreach ($this->fkTables as $fk) {
        $pk = isset($fk['pk']) ? implode(',', $fk['pk']) : 'id';
        $fetch = $this->connection->fetchAll('SELECT '. $pk .', '. $fk['key'] .' FROM '. $fk['table']);
        echo 'Adding uuid to table "' . $fk['table'] . '"...' . PHP_EOL;
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

    private function getKeyName(string $table, string $key): string
    {
      // code from AbstractAsset dbal
      $hash = implode('', array_map(function($column) {
            return dechex(crc32($column));
        }, [$table, $key]));
      return substr(strtoupper('FK' . '_' . $hash), 0, 30);
    }

    public function deletePreviousFKs()
    {
      $this->write('Deleting previous foreign keys...');
      foreach ($this->fkTables as $fk) {
        if (isset($fk['pk'])) { // if fk is in primary key
          $this->connection->executeQuery('ALTER TABLE '. $fk['table'] .' DROP PRIMARY KEY');
        }
        $this->connection->executeQuery('ALTER TABLE '. $fk['table'] .' DROP FOREIGN KEY '. $this->getKeyName($fk['table'], $fk['key']));
        $this->connection->executeQuery('ALTER TABLE '. $fk['table'] .' DROP COLUMN '. $fk['key']);
      }
    }

    public function renameNewFKsToPreviousNames()
    {
        $this->write('Renaming new foreign keys to previous names...');
        foreach ($this->fkTables as $fk) {
            $this->connection->executeQuery('ALTER TABLE '. $fk['table'] .' CHANGE '. $fk['tmpKey'] . ' ' . $fk['key']. ' CHAR(36) '. ($fk['nullable'] ? '' : 'NOT NULL ') .'COMMENT \'(DC2Type:guid)\'');
        }
    }

    public function dropIdPrimaryKeyAndSetUuidToPrimaryKey()
    {
        // if this fail you probably still have a FK referencing id
        $this->connection->executeQuery('ALTER TABLE '. $this->table .' DROP PRIMARY KEY');
        $this->connection->executeQuery('ALTER TABLE '. $this->table .' DROP COLUMN id');
        $this->connection->executeQuery('ALTER TABLE '. $this->table .' CHANGE uuid id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\'');
        $this->connection->executeQuery('ALTER TABLE '. $this->table .' ADD PRIMARY KEY (id)');
    }

    public function postUp(Schema $schema)
    {
        $this->generateUuidsToReplaceIds();
        $this->addThoseUuidsToTablesWithFK();
        $this->deletePreviousFKs();
        $this->renameNewFKsToPreviousNames();
        $this->dropIdPrimaryKeyAndSetUuidToPrimaryKey();
    }

    public function down(Schema $schema)
    {
    }
}
