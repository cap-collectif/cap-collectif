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
        $defaultLocale = $this->entityManager->getRepository(Locale::class)->getDefaultCode();
        $locales = $this->getLocales($defaultLocale);

        foreach (self::PARAMETERS as $parameterKey) {
            $parameter = $this->entityManager->getRepository(SiteParameter::class)->findOneBy([
                'keyname' => $parameterKey,
            ]);
            if ($parameter) {
                $defaultValue = $this->getDefaultValue($parameterKey, $defaultLocale);
                foreach ($locales as $locale) {
                    $this->addSql(
                        self::addTranslationSQL(
                            $parameter->getId(),
                            $defaultValue,
                            $locale->getCode()
                        )
                    );
                }
            }
        }
    }

    public function down(Schema $schema): void
    {
    }

    private function getDefaultValue(string $parameterKey, string $defaultLocale): string
    {
        return (string) $this->entityManager
            ->getRepository(SiteParameter::class)
            ->getValue($parameterKey, $defaultLocale);
    }

    private function getLocales(string $defaultLocale): array
    {
        $locales = [];
        foreach ($this->entityManager->getRepository(Locale::class)->findAll() as $locale) {
            if ($locale->getCode() !== $defaultLocale) {
                $locales[] = $locale;
            }
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
