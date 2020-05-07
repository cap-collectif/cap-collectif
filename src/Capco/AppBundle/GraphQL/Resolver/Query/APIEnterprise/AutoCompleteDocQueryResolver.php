<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise;

use Capco\AppBundle\Cache\RedisCache;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\HttpClient\HttpClient;

class AutoCompleteDocQueryResolver implements ResolverInterface
{
    public const AUTOCOMPLETE_DOC_CACHE_KEY = 'AUTOCOMPLETE_DOC_CACHE_KEY_V3';

    private $pdfGenerator;
    private $apiToken;
    private $autoCompleteUtils;
    private $rootDir;
    private $cache;

    public function __construct(
        RedisCache $cache,
        APIEnterprisePdfGenerator $pdfGenerator,
        APIEnterpriseAutoCompleteUtils $autoCompleteUtils,
        $apiToken,
        $rootDir
    ) {
        $this->pdfGenerator = $pdfGenerator;
        $this->apiToken = $apiToken;
        $this->autoCompleteUtils = $autoCompleteUtils;
        $this->rootDir = $rootDir;
        $this->cache = $cache;
    }

    public function __invoke(Arg $args): array
    {
        $dgfip = null;
        $acoss = null;
        $greffe = null;
        $kbis = null;
        $documentAsso = null;
        $basePath = sprintf('%s/public/export/', $this->rootDir);
        $id = $args->offsetGet('id');
        $type = $args->offsetGet('type');
        $docs = [];
        $cacheKey = self::getCacheKey($id, $type);

        $client = HttpClient::create([
            'auth_bearer' => $this->apiToken,
        ]);

        if (APIEnterpriseTypeResolver::PUBLIC_ORGA === $type) {
            $siren = substr($id, 0, 9);
            $greffe = $this->autoCompleteUtils->makeGetRequest(
                $client,
                "https://entreprise.api.gouv.fr/v2/extraits_rcs_infogreffe/${siren}"
            );
            $greffe = $this->autoCompleteUtils->accessRequestObjectSafely($greffe)
                ? ($greffe = json_encode($greffe))
                : null;
            $kbis = $this->pdfGenerator->jsonToPdf($greffe, $basePath, "${id}_kbis");

            $this->autoCompleteUtils->saveInCache($cacheKey, [
                'kbis' => $kbis,
            ]);

            return [
                'availableKbis' => isset($kbis),
            ];
        }

        if (APIEnterpriseTypeResolver::ASSOCIATION === $type) {
            $rnaOrSiret = $id;
            $documentAsso = $this->autoCompleteUtils->makeGetRequest(
                $client,
                "https://entreprise.api.gouv.fr/v2/documents_associations/${rnaOrSiret}",
                12
            );

            $documentAsso = $this->autoCompleteUtils->accessRequestObjectSafely($documentAsso);

            $compo = null;
            $compoLastTimeStamp = 0;
            $status = null;
            $statusLastTimeStamp = 0;
            $receipt = null;
            $receiptLastTimeStamp = 0;
            $documents = $documentAsso['documents'] ?? null;
            if (isset($documents)) {
                foreach ($documents as $doc) {
                    if (
                        'Liste dirigeants' === $doc['type'] &&
                        $doc['timestamp'] > $compoLastTimeStamp
                    ) {
                        $compo = $doc['url'] ?? null;
                        $compoLastTimeStamp = $doc['timestamp'];
                    } elseif (
                        'Statuts' === $doc['type'] &&
                        $doc['timestamp'] > $statusLastTimeStamp
                    ) {
                        $status = $doc['url'] ?? null;
                        $statusLastTimeStamp = $doc['timestamp'];
                    } elseif (
                        'Récépissé de modification' === $doc['type'] &&
                        $doc['timestamp'] > $receiptLastTimeStamp
                    ) {
                        $receipt = $doc['url'] ?? null;
                        $receiptLastTimeStamp = $doc['timestamp'];
                    }
                }
            }

            $status = $this->pdfGenerator->urlToPdf($status, $basePath, "${id}_status");
            $compo = $this->pdfGenerator->urlToPdf($compo, $basePath, "${id}_composition_ca");
            $receipt = $this->pdfGenerator->urlToPdf($receipt, $basePath, "${id}_receipt");

            $docs = array_merge($docs, [
                'availableCompositionCA' => isset($compo),
                'availableStatus' => isset($status),
                'availablePrefectureReceiptConfirm' => isset($receipt),
            ]);
            $this->autoCompleteUtils->saveInCache($cacheKey, [
                'compositionCA' => $compo,
                'status' => $status,
                'prefectureReceiptConfirm' => $receipt,
            ]);

            return $docs;
        }

        if (APIEnterpriseTypeResolver::ENTERPRISE === $type) {
            $siren = substr($id, 0, 9);
            $dgfip = $this->autoCompleteUtils->makeGetRequest(
                $client,
                "https://entreprise.api.gouv.fr/v2/attestations_fiscales_dgfip/${siren}"
            );
            $acoss = $this->autoCompleteUtils->makeGetRequest(
                $client,
                "https://entreprise.api.gouv.fr/v2/attestations_sociales_acoss/${siren}",
                12
            );
            $greffe = $this->autoCompleteUtils->makeGetRequest(
                $client,
                "https://entreprise.api.gouv.fr/v2/extraits_rcs_infogreffe/${siren}"
            );
            // If the request returns an exception, it will be thrown when accessing the data
            $dgfip = $this->autoCompleteUtils->accessRequestObjectSafely($dgfip);
            $acoss = $this->autoCompleteUtils->accessRequestObjectSafely($acoss);

            $dgfip = $this->pdfGenerator->urlToPdf(
                $dgfip['url'] ?? null,
                $basePath,
                "${id}_attestations_fiscales"
            );
            $acoss = $this->pdfGenerator->urlToPdf(
                $acoss['url'] ?? null,
                $basePath,
                "${id}_attestations_sociales"
            );

            $greffe = $this->autoCompleteUtils->accessRequestObjectSafely($greffe)
                ? json_encode($greffe)
                : null;
            $greffe = isset($greffe) ? json_encode($greffe) : null;
            $kbis = $this->pdfGenerator->jsonToPdf($greffe, $basePath, "${id}_kbis");

            $docs = array_merge($docs, [
                'availableFiscalRegulationAttestation' => isset($dgfip),
                'availableSocialRegulationAttestation' => isset($acoss),
                'availableKbis' => isset($kbis),
            ]);
            //In this case, it is an enterprise
            $this->autoCompleteUtils->saveInCache($cacheKey, [
                'fiscalRegulationAttestation' => $dgfip,
                'socialRegulationAttestation' => $acoss,
                'kbis' => $kbis,
            ]);

            return $docs;
        }
    }

    public static function getCacheKey(string $id, string $type): string
    {
        return str_replace(' ', '', $id) . '_' . $type . '_' . self::AUTOCOMPLETE_DOC_CACHE_KEY;
    }
}
