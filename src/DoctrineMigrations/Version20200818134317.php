<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Entity\SiteParameter;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class Version20200818134317 extends AbstractMigration implements ContainerAwareInterface
{
    private const PARAMETERS = [
        'global.site.fullname',
        'global.site.organization_name',
        'admin.mail.notifications.receive_address',
    ];
    private EntityManagerInterface $entityManager;
    private UuidGenerator $uuidGenerator;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->entityManager = $container->get('doctrine')->getManager();
        $this->uuidGenerator = new UuidGenerator();
    }

    public function getDescription(): string
    {
        return 'translate basic parameters';
    }

    public function up(Schema $schema): void
    {
        $defaultLocale = $this->getDefaultLocale();
        $allLocales = $this->getLocales();

        foreach (self::PARAMETERS as $parameterKey) {
            $parameterId = $this->getParameterId($parameterKey);
            if ($parameterId) {
                $existingTranslations = $this->getExistingTranslations($parameterId);

                $defaultValue = $this->getDefaultValue($defaultLocale, $existingTranslations);

                foreach ($allLocales as $locale) {
                    if (!isset($existingTranslations[$locale])) {
                        $this->addSql(
                            self::addTranslationSQL(
                                $parameterId,
                                $defaultValue,
                                $locale
                            )
                        );
                    }
                }
            }
        }
    }

    public function down(Schema $schema): void
    {
    }

    private function getDefaultLocale(): string
    {
        return $this->connection->fetchColumn('SELECT code FROM locale WHERE is_default = 1');
    }

    private function getParameterId(string $parameterKey): ?string
    {
        $id = $this->connection->fetchColumn("SELECT id FROM site_parameter WHERE keyname = '$parameterKey'");
        if (!$id) {
            return null;
        }

        return $id;
    }

    private function getDefaultValue(string $defaultLocale, array $translations): string
    {
        return isset($existingTranslations[$defaultLocale]) ? $existingTranslations[$defaultLocale] : '';
    }

    private function getExistingTranslations(string $parameterId): array
    {
        $existingTranslations = [];
        $query = $this->connection->query(
            "SELECT id, value, locale FROM site_parameter_translation WHERE translatable_id = '$parameterId'"
        );
        while ($row = $query->fetch()) {
            $existingTranslations[$row['locale']] = $row['value'];
        }

        return $existingTranslations;
    }

    private function getLocales(): array
    {
        $query = $this->connection->query('SELECT code FROM locale');
        $locales = [];
        while($code = $query->fetchColumn(0)) {
            $locales[] = $code;
        }

        return $locales;
    }

    private function addTranslationSQL(
        string $translatableId,
        string $value,
        string $locale
    ): string {

        $uuid = $this->uuidGenerator->generate($this->entityManager, null);

        return 'INSERT INTO `site_parameter_translation` (`id`, `translatable_id`, `value`, `locale`)' .
            " VALUES ('${uuid}', '${translatableId}', '${value}', '${locale}')";
    }
}
