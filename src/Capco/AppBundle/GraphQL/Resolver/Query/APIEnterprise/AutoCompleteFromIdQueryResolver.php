<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise;

use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\HttpClient\HttpClient;

class AutoCompleteFromIdQueryResolver implements ResolverInterface
{
    private $apiToken;
    private $autocompleteUtils;

    public function __construct(
        APIEnterpriseAutoCompleteUtils $autoCompleteUtils,
        $apiToken
    ) {
        $this->autocompleteUtils = $autoCompleteUtils;
        $this->apiToken = $apiToken;
    }

    public function __invoke(Arg $args): array
    {
        $assoId = $args->offsetGet('id');

        $client = HttpClient::create([
            'auth_bearer' => $this->apiToken,
        ]);

        $assoc = $this->autocompleteUtils->makeGetRequest(
            $client,
            "https://entreprise.api.gouv.fr/v2/associations/${assoId}"
        );
        $assoc = $this->autocompleteUtils->accessRequestObjectSafely($assoc)['association'];

        return [
            'type' => APIEnterpriseTypeResolver::ASSOCIATION,
            'corporateName' => $assoc['titre'] ?? '',
            'corporateAddress' => isset($assoc['adresse_siege'])
                ? $this->autocompleteUtils->formatAddressFromJSON($assoc['adresse_siege'])
                : '',
        ];
    }
}
