<?php

namespace Capco\AppBundle;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\ORM\Id\UuidGenerator;

class IdToUuidMigration extends AbstractMigration implements ContainerAwareInterface
{
    protected $em;
    protected $idToUuidMap = [];
    protected $generator;
    protected $fks;
    protected $table;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->em = $container->get('doctrine')->getManager();
        $this->connection = $this->em->getConnection();
        $this->generator = new UuidGenerator();
    }

    public function up(Schema $schema)
    {

    }

    public function prepare(string $tableName, $dbName = 'symfony')
    {
      $this->table = $tableName;
      $this->fks = [];
      $this->idToUuidMap = [];
      $sm = $this->connection->getSchemaManager();
      foreach ($sm->listTables($dbName) as $table) {
          $foreignKeys = $sm->listTableForeignKeys($table->getName());
          foreach ($foreignKeys as $foreignKey) {
            if ($foreignKey->getForeignTableName() === $this->table && $foreignKey->getForeignColumns()[0] === "id") {
              $nullable = true;
              foreach ($table->getColumns() as $column) {
                  var_dump($column->getName());
                  if ($column->getName() === $foreignKey->getColumns()[0]) {
                    if ($column->getNotnull()) {
                        $nullable = false;
                    }
                    break;
                 }
              }
              $fk = [
                  'table' => $table->getName(),
                  'key' => $foreignKey->getColumns()[0],
                  'tmpKey' => str_replace('id', 'uuid', $foreignKey->getColumns()[0]),
                  'nullable' => $nullable,
                  'onDelete' => $foreignKey->onDelete(),
                  'name' => $foreignKey->getName(),
              ];
              var_dump($table->getPrimaryKeyColumns());
              if (in_array($foreignKey->getColumns()[0], $table->getPrimaryKeyColumns())) {
                $fk['pk'] = $table->getPrimaryKeyColumns();
              }
              $this->fks[] = $fk;
           }
        }
      }
    }

    public function addUuidFields()
    {
        $this->connection->executeQuery('ALTER TABLE ' . $this->table . ' ADD uuid CHAR(36) COMMENT \'(DC2Type:guid)\' FIRST');
        foreach ($this->fks as $fk) {
            $this->connection->executeQuery('ALTER TABLE '. $fk['table'] .' ADD '. $fk['tmpKey'] .' CHAR(36) COMMENT \'(DC2Type:guid)\'');
        }
    }

    public function generateUuidsToReplaceIds()
    {
      $fetchs = $this->connection->fetchAll('SELECT id from ' . $this->table);
      foreach ($fetchs as $fetch) {
          $id = $fetch['id'];
          echo 'Creating uuid for id: ' . $fetch['id'] . PHP_EOL;
          $uuid = $this->generator->generate($this->em, null);
          $this->idToUuidMap[$id] = $uuid;
          $this->connection->update($this->table, ['uuid' => $uuid], ['id' => $id]);
      }
    }

    public function addThoseUuidsToTablesWithFK()
    {
      echo 'Adding uuid to every table with fks...' . PHP_EOL;
      foreach ($this->fks as $fk) {
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
      return substr(strtoupper($hash), 0, 30);
    }

    public function deletePreviousFKs()
    {
      // $this->write('Deleting previous foreign keys...');
      foreach ($this->fks as $fk) {
        if (isset($fk['pk'])) { // if fk is in primary key
          $this->connection->executeQuery('ALTER TABLE '. $fk['table'] .' DROP PRIMARY KEY');
        }
        $this->connection->executeQuery('ALTER TABLE '. $fk['table'] .' DROP FOREIGN KEY '. $fk['name']);
        $this->connection->executeQuery('ALTER TABLE '. $fk['table'] .' DROP COLUMN '. $fk['key']);
      }
    }

    public function renameNewFKsToPreviousNames()
    {
        // $this->write('Renaming new foreign keys to previous names...');
        foreach ($this->fks as $fk) {
            $this->connection->executeQuery('ALTER TABLE '. $fk['table'] .' CHANGE '. $fk['tmpKey'] . ' ' . $fk['key']. ' CHAR(36) '. ($fk['nullable'] ? '' : 'NOT NULL ') .'COMMENT \'(DC2Type:guid)\'');
        }
    }

    public function dropIdPrimaryKeyAndSetUuidToPrimaryKey()
    {
        // if this fail you probably still have a FK referencing id
        $this->connection->executeQuery('ALTER TABLE '. $this->table .' DROP PRIMARY KEY, DROP COLUMN id');
        $this->connection->executeQuery('ALTER TABLE '. $this->table .' CHANGE uuid id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\'');
        $this->connection->executeQuery('ALTER TABLE '. $this->table .' ADD PRIMARY KEY (id)');
    }

    public function restoreConstraintsAndIndexes()
    {
        foreach ($this->fks as $fk) {
          if (isset($fk['pk'])) {
            $this->connection->executeQuery('ALTER TABLE '. $fk['table'] .' ADD PRIMARY KEY ('. implode(',', $fk['pk']) .')');
          }
          $this->connection->executeQuery('ALTER TABLE '. $fk['table'] .' ADD CONSTRAINT '. $fk['name'] .' FOREIGN KEY ('.$fk['key'].') REFERENCES '.$this->table.' (id) ON DELETE '. $fk['onDelete']);
          $this->connection->executeQuery('CREATE INDEX IDX_'.$this->getKeyName($fk['table'], $fk['key']).' ON '. $fk['table'] .' ('.$fk['key'].')');
        }
    }

    public function migrate(string $tableName)
    {
      echo "Migrating " . $tableName . '...' . PHP_EOL;
      $this->prepare($tableName);
      $this->addUuidFields();
      $this->generateUuidsToReplaceIds();
      $this->addThoseUuidsToTablesWithFK();
      $this->deletePreviousFKs();
      $this->renameNewFKsToPreviousNames();
      $this->dropIdPrimaryKeyAndSetUuidToPrimaryKey();
      $this->restoreConstraintsAndIndexes();
    }

    public function postUp(Schema $schema)
    {

    }

    public function down(Schema $schema)
    {
    }
}
