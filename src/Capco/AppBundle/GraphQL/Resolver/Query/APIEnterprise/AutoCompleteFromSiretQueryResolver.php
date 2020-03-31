<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise;

use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class AutoCompleteFromSiretQueryResolver implements ResolverInterface
{
    private $apiToken;
    private $rootDir;
    private $pdfGenerator;
    private $autoCompleteUtils;
    public const AUTOCOMPLETE_SIRET_CACHE_KEY = 'AUTOCOMPLETE_SIRET_CACHE_KEY';

    public function __construct(APIEnterprisePdfGenerator $pdfGenerator, APIEnterpriseAutoCompleteUtils $autoCompleteUtils, $apiToken, $rootDir)
    {
        $this->apiToken = $apiToken;
        $this->pdfGenerator = $pdfGenerator;
        $this->autoCompleteUtils = $autoCompleteUtils;
        $this->rootDir = $rootDir;
    }

    public function __invoke(Arg $args): array
    {
        $siret = null;
        $exercices = null;
        $greffe = null;
        $basePath = sprintf('%s/public/export/', $this->rootDir);
        $type = $args->offsetGet('type');
        $siret = $args->offsetGet('siret');
        $siren = substr($siret, 0,9);

        $client = HttpClient::create([
            'auth_bearer' => $this->apiToken,
        ]);

        //We place it here to trigger the request immediately
        if ($type === APIEnterpriseTypeResolver::ASSOCIATION) {
            $greffe = $this->autoCompleteUtils->makeGetRequest($client, "https://entreprise.api.gouv.fr/v2/extraits_rcs_infogreffe/$siren");
        }
        try {
            $enterprise = $this->autoCompleteUtils->makeGetRequest($client, "https://entreprise.api.gouv.fr/v2/entreprises/$siren")->toArray();
        } catch (\Exception $e) {
            //We should have at least a match here.
            $message = $e->getMessage();
            throw new BadRequestHttpException("This siren does not match any entity: ${message}");
        }

        if ($type !== APIEnterpriseTypeResolver::PUBLIC_ORGA) {
            $exercices = $this->autoCompleteUtils->makeGetRequest($client, "https://entreprise.api.gouv.fr/v2/exercices/$siret");
        }

        $sirenSitu = json_encode($enterprise);


        $sirenSituPDF = $this->pdfGenerator->jsonToPdf($sirenSitu, $basePath, "${siren}_siren_situation");
        $basicInfo = [
            'type' => $type,
            'sirenSituation' => isset($sirenSituPDF),
            'siren' => $enterprise['entreprise']['siren'],
            'corporateName' => $enterprise['entreprise']['raison_sociale'] ?? '',
            'corporateAddress' => isset($enterprise['etablissement_siege']['adresse']) ? $this->autoCompleteUtils->formatAddressFromJSON($enterprise['etablissement_siege']['adresse']) : '',
        ];

        if ($type === APIEnterpriseTypeResolver::ASSOCIATION) {
            $greffe = $this->autoCompleteUtils->accessRequestObjectSafely($greffe) ? json_encode($greffe) : null;
            $greffe = isset($greffe) ? json_encode($greffe) : null;
            $kbis = $this->pdfGenerator->jsonToPdf($greffe, $basePath, "${siren}_kbis");
            $exercices = $this->autoCompleteUtils->accessRequestObjectSafely($exercices);
            $exercices = isset($exercices) ? json_encode($exercices['exercices']) : null;

            $this->autoCompleteUtils->saveInCache($siret . '_' . self::AUTOCOMPLETE_SIRET_CACHE_KEY,
                array_merge($basicInfo, [
                    'kbis' => $kbis,
                    'turnover' => $exercices ?? '',
                    'sirenSituation' => $sirenSituPDF
                ])
            );
            return array_merge($basicInfo, [
                'availableKbis' => isset($kbis),
                'availableTurnover' => isset($exercices),
            ]);
        }

        if ($type === APIEnterpriseTypeResolver::ENTERPRISE) {
            $exercices = $this->autoCompleteUtils->accessRequestObjectSafely($exercices);
            $exercices = isset($exercices) ? json_encode($exercices['exercices']) : null;

            $this->autoCompleteUtils->saveInCache($siret . '_' . self::AUTOCOMPLETE_SIRET_CACHE_KEY,
                array_merge($basicInfo, [
                    'turnover' => $exercices ?? '',
                    'sirenSituation' => $sirenSituPDF
                    ])
            );
            return array_merge($basicInfo, [
                'availableTurnover' => isset($exercices),
            ]);
        }
        $this->autoCompleteUtils->saveInCache($siret . '_' . self::AUTOCOMPLETE_SIRET_CACHE_KEY,
            array_merge($basicInfo, [
                'sirenSituation' => $sirenSituPDF
            ]));
        return $basicInfo;
    }
}
