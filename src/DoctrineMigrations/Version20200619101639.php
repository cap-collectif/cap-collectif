<?php

namespace Application\Migrations;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\MigrationHelper\AbstractLocaleMigration;

final class Version20200619101639 extends AbstractLocaleMigration
{
    public function getLocales(): array
    {
        return [new Locale('oc-OC', 'gascon'), new Locale('eu-EU', 'basque')];
    }
}
