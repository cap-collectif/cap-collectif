<?php

namespace Application\Migrations;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\MigrationHelper\AbstractLocaleMigration;

final class Version20191127173039 extends AbstractLocaleMigration
{
    private const GET_DEFAULT_SQL = "select value from site_parameter where keyname='global.locale';";

    public function getLocales(): array
    {
        return $this->setDefaultFromPreviousConf(
            [
                new Locale('fr-FR', 'french'),
                new Locale('en-GB', 'english'),
                new Locale('de-DE', 'deutsch'),
                new Locale('es-ES', 'spanish'),
                new Locale('nl-NL', 'dutchman')
            ],
            $this->getPreviousConfDefaultCode()
        );
    }

    private function setDefaultFromPreviousConf(
        array $locales,
        string $previousConfDefaultCode
    ): array {
        foreach ($locales as $locale) {
            if ($locale->getCode() === $previousConfDefaultCode) {
                $locale
                    ->enable()
                    ->publish()
                    ->setDefault();

                break;
            }
        }

        return $locales;
    }

    private function getPreviousConfDefaultCode(): string
    {
        return $this->connection->executeQuery(self::GET_DEFAULT_SQL)->fetch(\PDO::FETCH_COLUMN) ??
            'fr-FR';
    }
}
