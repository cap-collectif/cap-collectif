<?php

namespace Capco\AppBundle\GraphQL\Mutation\Locale;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Exception\LocaleConfigurationException;
use Capco\AppBundle\Repository\LocaleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UpdateLocaleStatusMutation implements MutationInterface
{
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
        $localeId = $args->offsetGet('id');
        $locale = $this->localeRepository->find($localeId);
        if (!($locale instanceof Locale)) {
            throw new UserError("unknown locale : ${localeId}");
        }

        try {
            self::updateLocaleWithEnableAndPublish(
                $locale,
                $args->offsetGet('enabled'),
                $args->offsetGet('published')
            );
        } catch (LocaleConfigurationException $localeConfigurationException) {
            throw new UserError('Locale configuration error');
        }

        $this->entityManager->flush();

        return compact('locale');
    }

    private static function updateLocaleWithEnableAndPublish(
        Locale $locale,
        ?bool $enabled = null,
        ?bool $published = null
    ): Locale {
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

        return $locale;
    }
}
