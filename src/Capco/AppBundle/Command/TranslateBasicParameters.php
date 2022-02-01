<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class TranslateBasicParameters extends Command
{
    private const PARAMETERS = [
        'global.site.fullname',
        'global.site.organization_name',
        'admin.mail.notifications.receive_address',
    ];

    private EntityManagerInterface $entityManager;
    private LocaleRepository $localeRepository;
    private SiteParameterRepository $siteParameterRepository;

    public function __construct(string $name, EntityManagerInterface $entityManager)
    {
        parent::__construct($name);
        $this->entityManager = $entityManager;
        $this->localeRepository = $entityManager->getRepository(Locale::class);
        $this->siteParameterRepository = $entityManager->getRepository(SiteParameter::class);
    }

    protected function configure()
    {
        $this->setName('capco:reset:translate-parameters')
            ->setDescription('translate basic parameters')
            ->addOption(
                'defaultLocale',
                'c',
                InputOption::VALUE_REQUIRED,
                'code of the default locale'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $output->writeln('<info>Translate basic parameters : </info>');
        $defaultLocale = $input->getOption('defaultLocale');
        $locales = $this->getLocales($defaultLocale, $output);

        foreach (self::PARAMETERS as $parameterKey) {
            $defaultValue = $this->getDefaultValue($parameterKey, $defaultLocale);
            $this->getAndTranslateSiteParameter($parameterKey, $defaultValue, $locales, $output);
        }

        $this->entityManager->flush();

        return 0;
    }

    private function getAndTranslateSiteParameter(
        string $parameterKey,
        string $defaultValue,
        array $locales,
        OutputInterface $output
    ): ?SiteParameter {
        $siteParameter = $this->getSiteParameter($parameterKey);
        if (null === $siteParameter) {
            $output->writeln("<error>Parameter ${parameterKey} not found</error>");
        } else {
            self::translateSiteParameter($siteParameter, $defaultValue, $locales);
            $this->entityManager->persist($siteParameter);
        }

        return $siteParameter;
    }

    private static function translateSiteParameter(
        SiteParameter $siteParameter,
        string $defaultValue,
        array $locales
    ): void {
        $siteParameter->getNewTranslations()->clear();
        foreach ($locales as $localeCode) {
            $siteParameter->setValue($defaultValue, $localeCode);
        }
        $siteParameter->mergeNewTranslations();
    }

    private function getSiteParameter(string $keyname): ?SiteParameter
    {
        return $this->siteParameterRepository->findOneBy([
            'keyname' => $keyname,
        ]);
    }

    private function getDefaultValue(string $parameterKey, string $defaultLocaleCode): string
    {
        return $this->siteParameterRepository->getValue($parameterKey, $defaultLocaleCode);
    }

    private function getLocales(string $defaultLocaleCode, OutputInterface $output): array
    {
        $locales = [];
        foreach ($this->localeRepository->findAll() as $locale) {
            if ($locale->getCode() !== $defaultLocaleCode) {
                $locales[] = $locale;
                $output->writeln(
                    '... ' . $locale->getTraductionKey() . ' (' . $locale->getCode() . ')'
                );
            }
        }

        return $locales;
    }
}
