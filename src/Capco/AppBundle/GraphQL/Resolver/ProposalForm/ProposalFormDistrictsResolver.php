<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\GraphQL\Resolver\Locale\GraphQLLocaleResolver;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalFormDistrictsResolver implements QueryInterface
{
    public function __construct(private readonly GraphQLLocaleResolver $localeResolver)
    {
    }

    public function __invoke(ProposalForm $form, ?string $order): array
    {
        $districts = $form->getDistricts()->toArray();
        if ('ALPHABETICAL' === $order) {
            $locale = $this->localeResolver->resolve();
            usort($districts, fn ($a, $b) => (string) $a->getName($locale, true) <=> (string) $b->getName($locale, true));
        }

        return $districts;
    }
}
