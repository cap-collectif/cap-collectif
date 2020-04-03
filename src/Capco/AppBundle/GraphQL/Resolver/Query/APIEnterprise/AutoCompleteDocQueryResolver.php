<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise;

use Capco\AppBundle\Cache\RedisCache;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\HttpClient\HttpClient;

class AutoCompleteDocQueryResolver implements ResolverInterface
{

    private $pdfGenerator;
    private $apiToken;
    private $autoCompleteUtils;
    private $rootDir;
    private $cache;
    public const AUTOCOMPLETE_DOC_CACHE_KEY = 'AUTOCOMPLETE_DOC_CACHE_KEY';
    public const AUTOCOMPLETE_DOC_CACHE_VISIBILITY_KEY = 'AUTOCOMPLETE_DOC_CACHE_VISIBILITY_KEY';


    public function __construct(RedisCache $cache, APIEnterprisePdfGenerator $pdfGenerator, APIEnterpriseAutoCompleteUtils $autoCompleteUtils, $apiToken, $rootDir)
    {
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
        $documentAsso = null;
        $basePath = sprintf('%s/public/export/', $this->rootDir);
        $id = $args->offsetGet('id');
        $type = $args->offsetGet('type');
        $docs = [];
        $cacheKey = $id . '_' . $type . '_' . self::AUTOCOMPLETE_DOC_CACHE_KEY;
        $visibilityCacheKey = $id . '_' . $type . '_' . self::AUTOCOMPLETE_DOC_CACHE_VISIBILITY_KEY;

        if ($this->cache->hasItem($visibilityCacheKey)){
            return $this->cache->getItem($visibilityCacheKey)->get();
        }

        $client = HttpClient::create([
            'auth_bearer' => $this->apiToken,
        ]);

        if ($type === APIEnterpriseTypeResolver::ASSOCIATION){
            $dgfip = $this->autoCompleteUtils->makeGetRequest($client, "https://entreprise.api.gouv.fr/v2/attestations_fiscales_dgfip/$id");
            $acoss = $this->autoCompleteUtils->makeGetRequest($client, "https://entreprise.api.gouv.fr/v2/attestations_sociales_acoss/$id");
            $documentAsso = $this->autoCompleteUtils->makeGetRequest($client, "https://entreprise.api.gouv.fr/v2/documents_associations/$id");
        }
        if ($type === APIEnterpriseTypeResolver::ENTERPRISE){
            $dgfip = $this->autoCompleteUtils->makeGetRequest($client, "https://entreprise.api.gouv.fr/v2/attestations_fiscales_dgfip/$id");
            $acoss = $this->autoCompleteUtils->makeGetRequest($client, "https://entreprise.api.gouv.fr/v2/attestations_sociales_acoss/$id");
            $greffe = $this->autoCompleteUtils->makeGetRequest($client, "https://entreprise.api.gouv.fr/v2/extraits_rcs_infogreffe/$id");
        }
        if ($type === APIEnterpriseTypeResolver::PUBLIC_ORGA){
            $greffe = $this->autoCompleteUtils->makeGetRequest($client, "https://entreprise.api.gouv.fr/v2/extraits_rcs_infogreffe/$id");
            $greffe = $this->autoCompleteUtils->accessRequestObjectSafely($greffe) ? $greffe = json_encode($greffe) : null;
            $kbis = $this->pdfGenerator->jsonToPdf($greffe, $basePath, "${id}_kbis");

            $this->autoCompleteUtils->saveInCache($cacheKey,
                [
                    'kbis' => $kbis
                ]);
            $docs = [
                'availableKbis' => isset($kbis),
            ];
            $this->autoCompleteUtils->saveInCache($visibilityCacheKey, $docs);
            return $docs;
        }

        //If the request returns an exception, it will be thrown when accessing the data
        $dgfip = $this->autoCompleteUtils->accessRequestObjectSafely($dgfip);
        $acoss = $this->autoCompleteUtils->accessRequestObjectSafely($acoss);

        $dgfip = $this->pdfGenerator->urlToPdf($dgfip['url'] ?? null, $basePath, "${id}_attestations_fiscales");
        $acoss = $this->pdfGenerator->urlToPdf($acoss['url'] ?? null, $basePath, "${id}_attestations_sociales");
        $greffe = $this->autoCompleteUtils->accessRequestObjectSafely($greffe) ? json_encode($greffe) : null;
        $greffe = isset($greffe) ? json_encode($greffe) : null;
        $kbis = $this->pdfGenerator->jsonToPdf($greffe, $basePath, "${id}_kbis");

        $docs = array_merge($docs, [
            'availableFiscalRegulationAttestation' => isset($dgfip),
            'availableSocialRegulationAttestation' => isset($acoss),
            'availableKbis' => isset($kbis),
        ]);

        if ($type === APIEnterpriseTypeResolver::ASSOCIATION) {
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
                    if ($doc['type'] === 'Liste dirigeants' && $doc['timestamp'] > $compoLastTimeStamp) {
                        $compo = $doc['url'] ?? null;
                        $compoLastTimeStamp = $doc['timestamp'];
                    } else if ($doc['type'] === 'Statuts' && $doc['timestamp'] > $statusLastTimeStamp) {
                        $status = $doc['url'] ?? null;
                        $statusLastTimeStamp = $doc['timestamp'];
                    } else if ($doc['type'] === 'Récépissé de modification' && $doc['timestamp'] > $receiptLastTimeStamp) {
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
                'availablePrefectureReceiptConfirm' => isset($receipt)
            ]);
            $this->autoCompleteUtils->saveInCache($cacheKey,
                [
                    'compositionCA' => $compo,
                    'status' => $status,
                    'prefectureReceiptConfirm' => $receipt,
                    'fiscalRegulationAttestation' => $dgfip,
                    'socialRegulationAttestation' => $acoss,
                    'kbis' => $kbis,
                ]);
        } else {
            //In this case, it is an enterprise
            $this->autoCompleteUtils->saveInCache($cacheKey,
                [
                    'fiscalRegulationAttestation' => $dgfip,
                    'socialRegulationAttestation' => $acoss,
                    'kbis' => $kbis,
                ]);
        }
        $this->autoCompleteUtils->saveInCache($visibilityCacheKey, $docs);
        return $docs;
    }
}
