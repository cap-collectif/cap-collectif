<?php

namespace Capco\AppBundle\MigrationHelper;

use Capco\AppBundle\Toggle\Manager;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Abstract class to handle feature flag migrations :
 * * to change a flag, provide old and new flags
 * * to crate a flag, provide the new flag
 * * to remove a flag, provide the old flag.
 */
abstract class AbstractFeatureFlagMigration extends AbstractMigration implements ContainerAwareInterface
{
    protected Manager $manager;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->manager = $container->get(Manager::class);
    }

    public function up(Schema $schema): void
    {
        $this->changeFeatureFlag($this->getOldFlag(), $this->getNewFlag());
    }

    public function down(Schema $schema): void
    {
        $this->changeFeatureFlag($this->getNewFlag(), $this->getOldFlag());
    }

    abstract protected function getOldFlag(): ?string;

    abstract protected function getNewFlag(): ?string;

    private function changeFeatureFlag(?string $oldFlag, ?string $newFlag): void
    {
        if ($newFlag && $oldFlag) {
            $this->conditionalChangeFeatureFlag($oldFlag, $newFlag);
        } elseif ($newFlag) {
            $this->addFeatureFlag($newFlag);
        } elseif ($oldFlag) {
            $this->removeFeatureFlag($oldFlag);
        }
    }

    private function conditionalChangeFeatureFlag(string $oldFlag, string $newFlag): void
    {
        if ($this->manager->isActive($oldFlag)) {
            $this->addFeatureFlag($newFlag);
            $this->removeFeatureFlag($oldFlag);
        }
    }

    private function addFeatureFlag(string $flag): void
    {
        $this->manager->activate($flag);
    }

    private function removeFeatureFlag(string $flag): void
    {
        $this->manager->deactivate($flag);
    }
}
