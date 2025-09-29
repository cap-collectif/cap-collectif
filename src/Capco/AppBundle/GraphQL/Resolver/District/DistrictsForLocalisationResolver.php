<?php

namespace Capco\AppBundle\GraphQL\Resolver\District;

use Capco\AppBundle\Helper\GeometryHelper;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class DistrictsForLocalisationResolver implements QueryInterface
{
    public function __construct(
        private readonly ProposalFormRepository $proposalFormRepository
    ) {
    }

    public function __invoke(string $proposalFormId, float $latitude, float $longitude): array
    {
        $form = $this->proposalFormRepository->find($proposalFormId);
        $districts = $form->getDistricts();

        return $form->isProposalInAZoneRequired()
            ? $districts
                ->filter(fn ($district) => $district->getGeojson()
                    && GeometryHelper::isIncluded($longitude, $latitude, $district->getGeojson()), [])
                ->toArray()
            : $districts->toArray();
    }
}
