<?php

namespace Application\Migrations;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\MigrationHelper\AbstractLocaleMigration;

final class Version20200128111639 extends AbstractLocaleMigration
{
    public function getLocales(): array
    {
        return [new Locale('sv-SV', 'swedish')];
    }
}
