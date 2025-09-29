<?php

namespace Capco\AppBundle\GraphQL\Mutation\Locale;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\LocaleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class SetDefaultLocaleMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private EntityManagerInterface $entityManager,
        private LocaleRepository $localeRepository
    ) {
    }

    public function __invoke(Argument $args): array
    {
        $this->formatInput($args);
        $localeId = $args->offsetGet('id');
        $locale = $this->localeRepository->find($localeId);
        if (!($locale instanceof Locale)) {
            throw new UserError("unknown locale : {$localeId}");
        }
        if (!$locale->isPublished()) {
            throw new UserError("The locale {$localeId} is not published");
        }

        $locale = $this->changeDefaultLocale($locale);

        return compact('locale');
    }

    private function changeDefaultLocale(Locale $newDefault): Locale
    {
        $oldDefault = $this->localeRepository->findDefaultLocale();
        $oldDefault->unsetDefault();
        $newDefault->setDefault();

        $this->entityManager->flush();

        return $newDefault;
    }
}
