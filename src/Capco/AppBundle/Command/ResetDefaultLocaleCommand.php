<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Locale;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ResetDefaultLocaleCommand extends Command
{
    private readonly EntityManagerInterface $em;

    public function __construct(string $name, EntityManagerInterface $em)
    {
        parent::__construct($name);
        $this->em = $em;
    }

    protected function configure()
    {
        $this->setName('capco:reset:default-locale')
            ->setDescription('Set default locale while reinit')
            ->addOption('code', 'c', InputOption::VALUE_REQUIRED, 'Locale code use by default.')
            ->addOption('locale', 'l', InputOption::VALUE_REQUIRED, 'Language translation key.')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if ($this->isDefaultLocaleMissing()) {
            $localeCode = $input->getOption('code');
            $localeTranslationKey = $input->getOption('locale');
            $this->setDefaultLocale($localeCode, $localeTranslationKey);
        }

        return 0;
    }

    private function setDefaultLocale(string $localeCode, string $localeTransKey): Locale
    {
        $defaultLocale = new Locale($localeCode, $localeTransKey);
        $defaultLocale->enable();
        $defaultLocale->publish();
        $defaultLocale->setDefault();
        $this->em->persist($defaultLocale);
        $this->em->flush();

        return $defaultLocale;
    }

    private function isDefaultLocaleMissing(): bool
    {
        return empty(
            $this->em->getRepository(Locale::class)->findBy([
                'default' => true,
            ])
        );
    }
}
