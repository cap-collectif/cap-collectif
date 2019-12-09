<?php

namespace Capco\AppBundle\MigrationHelper;

use Capco\AppBundle\Entity\Locale;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

abstract class AbstractLocaleMigration extends AbstractMigration implements ContainerAwareInterface
{
    private $entityManager;
    private $uuidGenerator;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->entityManager = $container->get('doctrine')->getManager();
        $this->uuidGenerator = new UuidGenerator();
    }

    public function up(Schema $schema)
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
        $this->addLocales();
    }

    public function down(Schema $schema)
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
        $this->removeLocales();
    }

    /**
     * @return Locale[]
     */
    abstract protected function getLocales(): array;

    protected function addLocales(): void
    {
        foreach ($this->getLocales() as $locale) {
            $this->addSql($this->generateLocaleInsertSql($locale));
        }
    }

    protected function removeLocales(): void
    {
        foreach ($this->getLocales() as $locale) {
            $this->addSql(self::generateLocaleDeleteSql($locale));
        }
    }

    protected function generateLocaleInsertSql(Locale $locale): string
    {
        return "INSERT INTO locale (id, traduction_key, code, is_enabled, is_published, is_default) VALUES ('" .
            $this->generateUuid() .
            "', '" .
            $locale->getTraductionKey() .
            "', '" .
            $locale->getCode() .
            "', " .
            ($locale->isEnabled() ? 'true' : 'false') .
            ', ' .
            ($locale->isPublished() ? 'true' : 'false') .
            ', ' .
            ($locale->isDefault() ? 'true' : 'false') .
            ')';
    }

    protected static function generateLocaleDeleteSql(Locale $locale): string
    {
        return "DELETE FROM locale WHERE code = '" . $locale->getCode() . "'";
    }

    private function generateUuid(): string
    {
        return $this->uuidGenerator->generate($this->entityManager, null);
    }
}
