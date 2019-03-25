<?php

namespace Capco\AppBundle\GraphQL\Resolver\District;

use Capco\AppBundle\Helper\GeometryHelper;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class DistrictsForLocalisationResolver implements ResolverInterface
{
    private $proposalFormRepository;

    public function __construct(ProposalFormRepository $proposalFormRepository)
    {
        $this->proposalFormRepository = $proposalFormRepository;
    }

    public function __invoke(string $proposalFormId, float $latitude, float $longitude): array
    {
        $form = $this->proposalFormRepository->find($proposalFormId);
        $districts = $form->getDistricts();

        return $form->isProposalInAZoneRequired()
            ? $districts
                ->filter(function ($district) use ($longitude, $latitude) {
                    return $district->getGeojson() &&
                        GeometryHelper::isIncluded($longitude, $latitude, $district->getGeojson());
                }, [])
                ->toArray()
            : $districts->toArray();
    }
}
