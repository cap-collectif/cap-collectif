<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise\APIEnterpriseTypeResolver;
use Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise\AutoCompleteDocQueryResolver;
use Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise\AutoCompleteFromSiretQueryResolver;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

class PreFillProposalFormSubscriber implements EventSubscriberInterface
{
    private RedisCache $cache;
    private AutoCompleteDocQueryResolver $autoCompleteDocQueryResolver;
    private AutoCompleteFromSiretQueryResolver $autoCompleteFromSiretQueryResolver;
    private $shouldPreFillAPIEntreprise = false;
    private $indexTypeQuestion;
    private $indexRnaQuestion;
    private $indexNoRnaQuestion;
    private $siretIndexes;
    private $indexAssoSiren;
    private $indexEntrepriseSiren;
    private $indexEntrepriseTurnonver;
    private $indexOrgPubSiren;
    private $indexAssoSiretcompositionCA;
    private $indexAssoSiretStatus;
    private $indexAssoRnacompositionCA;
    private $indexAssoRnaPrefectureReceiptConfirm;
    private $indexAssoRnaStatus;
    private $indexEntrepriseFiscalReg;
    private $indexEntrepriseSocialReg;
    private $indexEntrepriseKbis;
    private $indexLocalOrGlobal;

    public function __construct(
        RedisCache $cache,
        AutoCompleteDocQueryResolver $autoCompleteDocQueryResolver,
        AutoCompleteFromSiretQueryResolver $autoCompleteFromSiretQueryResolver
    ) {
        $this->cache = $cache;
        $this->autoCompleteDocQueryResolver = $autoCompleteDocQueryResolver;
        $this->autoCompleteFromSiretQueryResolver = $autoCompleteFromSiretQueryResolver;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            FormEvents::PRE_SET_DATA => 'onPreSetData',
            FormEvents::PRE_SUBMIT => 'prefillForm',
        ];
    }

    public function setMediaFromAPIOrRequest(array $default, ?string $apiMediaId): ?array
    {
        if (empty($default)) {
            if (!$apiMediaId) {
                // This will throw exception…
                return null;
            }

            return [$apiMediaId];
        }

        return $default;
    }

    public function getSiret(array $values): ?string
    {
        foreach ($this->siretIndexes as $siret) {
            if (isset($values['responses'][$siret]['value'])) {
                return $values['responses'][$siret]['value'];
            }
        }

        return null;
    }

    public function getAPIEnterpriseData(FormEvent $event): void
    {
        $values = $event->getData();

        // If it's not answered, we have nothing to do.
        if (!$values['responses'][$this->indexLocalOrGlobal]['value']) {
            return;
        }

        $projectType = APIEnterpriseTypeResolver::getAPIEnterpriseProjectTypeFromString(
            json_decode($values['responses'][$this->indexLocalOrGlobal]['value'], true)['labels'][0]
        );

        // If it's not a local project, we have nothing to do.
        if (APIEnterpriseTypeResolver::LOCAL_PROJET !== $projectType) {
            return;
        }

        // If no type value, we can't do anything.
        if (!$values['responses'][$this->indexTypeQuestion]['value']) {
            return;
        }

        $type = APIEnterpriseTypeResolver::getAPIEnterpriseTypeFromString(
            json_decode($values['responses'][$this->indexTypeQuestion]['value'], true)['labels'][0]
        );

        if (APIEnterpriseTypeResolver::ASSOCIATION === $type) {
            // We check if it's no RNA and no SIRET, we can't do anything.
            if ($values['responses'][$this->indexNoRnaQuestion]['value']) {
                if (
                    'Non' ===
                    json_decode($values['responses'][$this->indexNoRnaQuestion]['value'], true)[
                        'labels'
                    ][0]
                ) {
                    return;
                }
            }
        }

        // rna
        $rna = $values['responses'][$this->indexRnaQuestion]['value'] ?? null;

        // siret
        $siret = !$rna ? $this->getSiret($values) : null;

        if ($siret) {
            $mainInfoKey = AutoCompleteFromSiretQueryResolver::getCacheKey($siret, $type);
            // Fallback in case not in redis
            if (!$this->cache->hasItem($mainInfoKey)) {
                $args = new Argument([
                    'siret' => $siret,
                    'type' => $type,
                ]);
                $this->autoCompleteFromSiretQueryResolver->__invoke($args);
            }
            $mainInfo = $this->cache->getItem($mainInfoKey)->get();

            switch ($type) {
                case APIEnterpriseTypeResolver::ASSOCIATION:
                    if ($siret) {
                        $values['responses'][$this->indexAssoSiren][
                            'medias'
                        ] = $this->setMediaFromAPIOrRequest(
                            $values['responses'][$this->indexAssoSiren]['medias'],
                            $mainInfo['sirenSituation']
                        );
                    }

                    break;
                case APIEnterpriseTypeResolver::ENTERPRISE:
                    $values['responses'][$this->indexEntrepriseSiren][
                        'medias'
                    ] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][$this->indexEntrepriseSiren]['medias'],
                        $mainInfo['sirenSituation']
                    );
                    $values['responses'][$this->indexEntrepriseTurnonver]['value'] =
                        $values['responses'][$this->indexEntrepriseTurnonver]['value'] ??
                        $mainInfo['turnover'];

                    break;
                case APIEnterpriseTypeResolver::PUBLIC_ORGA:
                    $values['responses'][$this->indexOrgPubSiren][
                        'medias'
                    ] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][$this->indexOrgPubSiren]['medias'],
                        $mainInfo['sirenSituation']
                    );

                    break;
            }
        }
        $docInfoKey = AutoCompleteDocQueryResolver::getCacheKey($siret ?? $rna, $type);
        if (!$this->cache->hasItem($docInfoKey)) {
            $args = new Argument([
                'id' => $siret ?? $rna,
                'type' => $type,
            ]);
            $this->autoCompleteDocQueryResolver->__invoke($args);
        }

        $docInfo = $this->cache->getItem($docInfoKey)->get();
        switch ($type) {
            case APIEnterpriseTypeResolver::ASSOCIATION:
                if ($siret) {
                    $values['responses'][$this->indexAssoSiretcompositionCA][
                        'medias'
                    ] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][$this->indexAssoSiretcompositionCA]['medias'],
                        $docInfo['compositionCA']
                    );
                    $values['responses'][$this->indexAssoSiretStatus][
                        'medias'
                    ] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][$this->indexAssoSiretStatus]['medias'],
                        $docInfo['status']
                    );
                }
                if ($rna) {
                    // Composition du conseil d'administration et du bureau
                    $values['responses'][$this->indexAssoRnacompositionCA][
                        'medias'
                    ] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][$this->indexAssoRnacompositionCA]['medias'],
                        $docInfo['compositionCA']
                    );
                    // Récépissé de la déclaration en préfecture (greffe des associations)
                    $values['responses'][$this->indexAssoRnaPrefectureReceiptConfirm][
                        'medias'
                    ] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][$this->indexAssoRnaPrefectureReceiptConfirm]['medias'],
                        $docInfo['prefectureReceiptConfirm']
                    );
                    // Statuts en vigueur datés et signés
                    $values['responses'][$this->indexAssoRnaStatus][
                        'medias'
                    ] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][$this->indexAssoRnaStatus]['medias'],
                        $docInfo['status']
                    );
                }

                break;
            case APIEnterpriseTypeResolver::ENTERPRISE:
                $values['responses'][$this->indexEntrepriseFiscalReg][
                    'medias'
                ] = $this->setMediaFromAPIOrRequest(
                    $values['responses'][$this->indexEntrepriseFiscalReg]['medias'],
                    $docInfo['fiscalRegulationAttestation']
                );
                $values['responses'][$this->indexEntrepriseSocialReg][
                    'medias'
                ] = $this->setMediaFromAPIOrRequest(
                    $values['responses'][$this->indexEntrepriseSocialReg]['medias'],
                    $docInfo['socialRegulationAttestation']
                );
                $values['responses'][$this->indexEntrepriseKbis][
                    'medias'
                ] = $this->setMediaFromAPIOrRequest(
                    $values['responses'][$this->indexEntrepriseKbis]['medias'],
                    $docInfo['kbis']
                );

                break;
            case APIEnterpriseTypeResolver::PUBLIC_ORGA:
                break;
        }
        $event->setData($values);
    }

    public function onPreSetData(FormEvent $event): void
    {
        $proposal = $event->getData();
        if ($proposal->isDraft()) {
            return;
        }
        $proposalForm = $proposal->getProposalForm();

        // Fixtures dev
        // https://capco.dev/project/budget-participatif-idf/collect/collecte-des-projets-idf-privee
        if ('proposalformIdf' === $proposalForm->getId()) {
            $this->shouldPreFillAPIEntreprise = true;
            $this->indexLocalOrGlobal = 1;
            $this->indexTypeQuestion = 22;
            $this->indexRnaQuestion = 35;
            $this->indexNoRnaQuestion = 34;
            $this->siretIndexes = [24, 51, 63];
            $this->indexAssoSiren = 29;
            $this->indexEntrepriseSiren = 56;
            $this->indexEntrepriseTurnonver = 59;
            $this->indexOrgPubSiren = 68;
            $this->indexAssoSiretcompositionCA = 30;
            $this->indexAssoSiretStatus = 31;
            $this->indexAssoRnacompositionCA = 40;
            $this->indexAssoRnaPrefectureReceiptConfirm = 41;
            $this->indexAssoRnaStatus = 43;
            $this->indexEntrepriseFiscalReg = 57;
            $this->indexEntrepriseSocialReg = 58;
            $this->indexEntrepriseKbis = 60;
        }
        // Session 1
        // https://budgetparticipatif.smartidf.services/project/le-budget-participatif-ecologique/collect/depot-des-projets
        if (
            'd6b98b9b-5e3c-11ea-8fab-0242ac110004' === $proposalForm->getId()
        ) {
            $this->shouldPreFillAPIEntreprise = true;
            $this->indexLocalOrGlobal = 1;
            $this->indexTypeQuestion = 20;
            $this->indexRnaQuestion = 33;
            $this->indexNoRnaQuestion = 32;
            $this->siretIndexes = [22, 49, 61];
            $this->indexOrgPubSiren = 66;
            $this->indexAssoSiren = 27;
            $this->indexEntrepriseSiren = 54;
            $this->indexEntrepriseTurnonver = 57;
            $this->indexAssoSiretcompositionCA = 28;
            $this->indexAssoSiretStatus = 29;
            $this->indexAssoRnacompositionCA = 38;
            $this->indexAssoRnaPrefectureReceiptConfirm = 39;
            $this->indexAssoRnaStatus = 41;
            $this->indexEntrepriseFiscalReg = 55;
            $this->indexEntrepriseSocialReg = 56;
            $this->indexEntrepriseKbis = 58;
        }
        // Session 2
        if (
            '30f7d752-087f-11eb-8305-0242ac110003' === $proposalForm->getId()
        ) {
            $this->shouldPreFillAPIEntreprise = true;
            $this->indexLocalOrGlobal = 2;
            $this->indexTypeQuestion = 22;
            $this->siretIndexes = [24, 51, 63];
            // Asso
            $this->indexAssoSiren = 29;
            $this->indexRnaQuestion = 35;
            $this->indexNoRnaQuestion = 34;
            $this->indexAssoSiretcompositionCA = 30;
            $this->indexAssoSiretStatus = 31;
            $this->indexAssoRnacompositionCA = 40;
            $this->indexAssoRnaPrefectureReceiptConfirm = 41;
            $this->indexAssoRnaStatus = 43;
            // Entreprise
            $this->indexEntrepriseSiren = 56;
            $this->indexEntrepriseFiscalReg = 57;
            $this->indexEntrepriseSocialReg = 58;
            $this->indexEntrepriseTurnonver = 59;
            $this->indexEntrepriseKbis = 60;
            // Org Pub
            $this->indexOrgPubSiren = 68;
        }
    }

    public function prefillForm(FormEvent $event): void
    {
        if ($this->shouldPreFillAPIEntreprise) {
            $this->getAPIEnterpriseData($event);
        }
    }
}
