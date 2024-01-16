<?php

namespace Capco\AppBundle\GraphQL\Mutation\Locale;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Exception\LocaleConfigurationException;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\LocaleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UpdateLocaleStatusMutation implements MutationInterface
{
    use MutationTrait;

    private $entityManager;
    private $localeRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        LocaleRepository $localeRepository
    ) {
        $this->entityManager = $entityManager;
        $this->localeRepository = $localeRepository;
    }

    public function __invoke(Argument $args): array
    {
        $this->formatInput($args);
        $localesInput = $args->offsetGet('locales');
        $locales = [];
        foreach ($localesInput as $localeInput) {
            $locales[] = $this->updateLocaleFromInput($localeInput);
        }

        $this->entityManager->flush();

        // @todo set the method as static
        return ['locales' => (new ConnectionBuilder())->connectionFromArray($locales)];
    }

    private function updateLocaleFromInput(array $localeInput): Locale
    {
        $locale = $this->getLocaleFromInput($localeInput);
        $enabled = $localeInput['isEnabled'] ?? null;
        $published = $localeInput['isPublished'] ?? null;
        self::updateLocaleWithEnableAndPublish($locale, $enabled, $published);

        return $locale;
    }

    private function getLocaleFromInput(array $localeInput): Locale
    {
        $locale = $this->localeRepository->find($localeInput['id']);
        if (!($locale instanceof Locale)) {
            throw new UserError('unknown locale : ' . $localeInput['id']);
        }

        return $locale;
    }

    private static function updateLocaleWithEnableAndPublish(
        Locale $locale,
        ?bool $enabled,
        ?bool $published
    ): Locale {
        try {
            if ($enabled) {
                $locale->enable();
            }
            if (false === $published) {
                $locale->unpublish();
            } elseif ($published) {
                $locale->publish();
            }
            if (false === $enabled) {
                $locale->disable();
            }
        } catch (LocaleConfigurationException $localeConfigurationException) {
            throw new UserError('Locale configuration error');
        }

        return $locale;
    }
}
