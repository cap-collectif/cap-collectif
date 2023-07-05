<?php

namespace Capco\AppBundle\MigrationHelper;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

abstract class AbstractTranslationMigration extends AbstractMigration implements ContainerAwareInterface
{
    protected static $entities = [];
    protected static $translations;

    protected $entityManager;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->entityManager = $container->get('doctrine')->getManager();
    }

    public function preUp(Schema $schema): void
    {
        self::$entities = $this->connection->fetchAll('SELECT * from ' . $this->getEntityTable());
    }

    public function postUp(Schema $schema): void
    {
        $generator = new UuidGenerator();
        $locale = $this->connection->fetchColumn('SELECT code FROM locale WHERE is_default = TRUE');
        foreach (self::$entities as $entity) {
            $dataToInsert = [
                'id' => $generator->generate($this->entityManager, null),
                'translatable_id' => $entity['id'],
                'locale' => $locale,
            ];
            foreach ($this->getFieldsToTranslate() as $fieldName) {
                $dataToInsert[$fieldName] = $entity[$fieldName];
            }
            $this->connection->insert($this->getTranslationTable(), $dataToInsert);
        }
    }

    public function preDown(Schema $schema): void
    {
        $locale = $this->connection->fetchColumn('SELECT code FROM locale WHERE is_default = TRUE');
        self::$translations = $this->connection->fetchAll(
            'SELECT * FROM ' . $this->getTranslationTable() . " WHERE locale = '" . $locale . "'"
        );
    }

    public function postDown(Schema $schema): void
    {
        foreach (self::$translations as $translation) {
            $fieldsToUpdate = [];
            foreach ($this->getFieldsToTranslate() as $fieldName) {
                $fieldsToUpdate[$fieldName] = $translation[$fieldName];
            }
            $this->connection->update($this->getEntityTable(), $fieldsToUpdate, [
                'id' => $translation['translatable_id'],
            ]);
        }
    }

    abstract public function getEntityTable(): string;

    abstract public function getTranslationTable(): string;

    abstract public function getFieldsToTranslate(): array;
}
