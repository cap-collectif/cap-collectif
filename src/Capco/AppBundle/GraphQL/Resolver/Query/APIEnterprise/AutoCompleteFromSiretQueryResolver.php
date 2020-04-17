<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise;

use Capco\AppBundle\Cache\RedisCache;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class AutoCompleteFromSiretQueryResolver implements ResolverInterface
{
    public const AUTOCOMPLETE_SIRET_CACHE_KEY = 'AUTOCOMPLETE_SIRET_CACHE_KEY';
    public const AUTOCOMPLETE_SIRET_VISIBILITY_CACHE_KEY = 'AUTOCOMPLETE_SIRET_VISIBILITY_CACHE_KEY';
    private $apiToken;
    private $rootDir;
    private $pdfGenerator;
    private $autoCompleteUtils;
    private $cache;

    public const USE_CACHE = false;

    public function __construct(
        RedisCache $cache,
        APIEnterprisePdfGenerator $pdfGenerator,
        APIEnterpriseAutoCompleteUtils $autoCompleteUtils,
        $apiToken,
        $rootDir
    ) {
        $this->apiToken = $apiToken;
        $this->pdfGenerator = $pdfGenerator;
        $this->autoCompleteUtils = $autoCompleteUtils;
        $this->rootDir = $rootDir;
        $this->cache = $cache;
    }

    public function __invoke(Arg $args): array
    {
        $siret = null;
        $exercices = null;
        $greffe = null;
        $basePath = sprintf('%s/public/export/', $this->rootDir);
        $type = $args->offsetGet('type');
        $siret = $args->offsetGet('siret');
        $siren = substr($siret, 0, 9);
        $cacheKey = $siret . '_' . $type . '_' . self::AUTOCOMPLETE_SIRET_CACHE_KEY;
        $cacheVisibilityKey =
            $siret . '_' . $type . '_' . self::AUTOCOMPLETE_SIRET_VISIBILITY_CACHE_KEY;

        if (self::USE_CACHE && $this->cache->hasItem($cacheVisibilityKey)) {
            return $this->cache->getItem($cacheVisibilityKey)->get();
        }

        $client = HttpClient::create([
            'auth_bearer' => $this->apiToken,
        ]);

        //We place it here to trigger the request immediately
        if (APIEnterpriseTypeResolver::ASSOCIATION === $type) {
            $greffe = $this->autoCompleteUtils->makeGetRequest(
                $client,
                "https://entreprise.api.gouv.fr/v2/extraits_rcs_infogreffe/${siren}"
            );
        }

        try {
            $enterprise = $this->autoCompleteUtils
                ->makeGetRequest($client, "https://entreprise.api.gouv.fr/v2/entreprises/${siren}")
                ->toArray();
        } catch (\Exception $e) {
            //We should have at least a match here.
            $message = $e->getMessage();

            throw new BadRequestHttpException("This siren does not match any entity: ${message}");
        }

        if (APIEnterpriseTypeResolver::PUBLIC_ORGA !== $type) {
            $exercices = $this->autoCompleteUtils->makeGetRequest(
                $client,
                "https://entreprise.api.gouv.fr/v2/exercices/${siret}"
            );
        }

        $sirenSitu = json_encode($enterprise);

        $sirenSituPDF = $this->pdfGenerator->jsonToPdf(
            $sirenSitu,
            $basePath,
            "${siren}_siren_situation"
        );
        $legalRpz = $enterprise['entreprise']['mandataires_sociaux'][0] ?? null;
        $basicInfo = [
            'type' => $type,
            'availableSirenSituation' => isset($sirenSituPDF),
            'legalRepresentative' => $legalRpz
                ? $legalRpz['prenom'] . ' ' . $legalRpz['nom']
                : null,
            'qualityRepresentative' => $legalRpz ? $legalRpz['fonction'] : null,
            'siren' => $enterprise['entreprise']['siren'],
            'corporateName' => $enterprise['entreprise']['raison_sociale'] ?? '',
            'corporateAddress' => isset($enterprise['etablissement_siege']['adresse'])
                ? $this->autoCompleteUtils->formatAddressFromJSON(
                    $enterprise['etablissement_siege']['adresse']
                )
                : '',
        ];

        if (APIEnterpriseTypeResolver::ASSOCIATION === $type) {
            $greffe = $this->autoCompleteUtils->accessRequestObjectSafely($greffe)
                ? json_encode($greffe)
                : null;
            $greffe = isset($greffe) ? json_encode($greffe) : null;
            $kbis = $this->pdfGenerator->jsonToPdf($greffe, $basePath, "${siren}_kbis");
            $exercices = $this->autoCompleteUtils->accessRequestObjectSafely($exercices);
            $exercices = isset($exercices)
                ? $this->autoCompleteUtils->formatTurnoverFromJSON($exercices['exercices'])
                : null;

            $this->autoCompleteUtils->saveInCache(
                $cacheKey,
                array_merge($basicInfo, [
                    'kbis' => $kbis,
                    'turnover' => $exercices ?? '',
                    'sirenSituation' => $sirenSituPDF,
                ])
            );

            $apiResponse = array_merge($basicInfo, [
                'availableKbis' => isset($kbis),
                'availableTurnover' => isset($exercices),
            ]);
            $this->autoCompleteUtils->saveInCache($cacheVisibilityKey, $apiResponse);

            return $apiResponse;
        }

        if (APIEnterpriseTypeResolver::ENTERPRISE === $type) {
            $exercices = $this->autoCompleteUtils->accessRequestObjectSafely($exercices);
            $exercices = isset($exercices)
                ? $this->autoCompleteUtils->formatTurnoverFromJSON($exercices['exercices'])
                : null;

            $this->autoCompleteUtils->saveInCache(
                $cacheKey,
                array_merge($basicInfo, [
                    'turnover' => $exercices ?? '',
                    'sirenSituation' => $sirenSituPDF,
                ])
            );
            $apiResponse = array_merge($basicInfo, [
                'availableTurnover' => isset($exercices),
            ]);
            $this->autoCompleteUtils->saveInCache($cacheVisibilityKey, $apiResponse);

            return $apiResponse;
        }
        $this->autoCompleteUtils->saveInCache(
            $cacheKey,
            array_merge($basicInfo, [
                'sirenSituation' => $sirenSituPDF,
            ])
        );

        $this->autoCompleteUtils->saveInCache($cacheVisibilityKey, $basicInfo);

        return $basicInfo;
    }
}
