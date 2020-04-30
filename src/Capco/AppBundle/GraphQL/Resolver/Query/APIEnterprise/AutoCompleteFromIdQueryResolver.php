<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise;

use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\HttpClient\HttpClient;

class AutoCompleteFromIdQueryResolver implements ResolverInterface
{
    private $apiToken;
    private $autocompleteUtils;

    public function __construct(APIEnterpriseAutoCompleteUtils $autoCompleteUtils, $apiToken)
    {
        $this->autocompleteUtils = $autoCompleteUtils;
        $this->apiToken = $apiToken;
    }

    public function __invoke(Arg $args): array
    {
        $assoId = $args->offsetGet('id');

        $client = HttpClient::create([
            'auth_bearer' => $this->apiToken,
        ]);

        $assocResponse = $this->autocompleteUtils->makeGetRequest(
            $client,
            "https://entreprise.api.gouv.fr/v2/associations/${assoId}",
            12
        );
        $assoc = $this->autocompleteUtils->accessRequestObjectSafely($assocResponse);

        if (!$assoc) {
            return [
                'type' => APIEnterpriseTypeResolver::ASSOCIATION,
                'corporateName' => '',
                'corporateAddress' => '',
            ];
        }

        $assocData = $assoc['association'];

        return [
            'type' => APIEnterpriseTypeResolver::ASSOCIATION,
            'corporateName' => $assocData['titre'] ?? '',
            'corporateAddress' => isset($assocData['adresse_siege'])
                ? $this->autocompleteUtils->formatAddressFromJSON($assocData['adresse_siege'])
                : '',
        ];
    }
}
