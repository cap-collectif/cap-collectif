<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise\APIEnterpriseTypeResolver;
use Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise\AutoCompleteDocQueryResolver;
use Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise\AutoCompleteFromSiretQueryResolver;
use Capco\AppBundle\Helper\EnvHelper;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

class PreFillProposalFormSubscriber implements EventSubscriberInterface
{
    private $cache;
    private $autoCompleteDocQueryResolver;
    private $autoCompleteFromSiretQueryResolver;

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
        if (isset($values['responses'][22]['value'])) {
            return $values['responses'][22]['value'];
        }

        if (isset($values['responses'][49]['value'])) {
            return $values['responses'][49]['value'];
        }

        return $values['responses'][61]['value'] ?? null;
    }

    public function getAPIEnterpriseData(FormEvent $event): void
    {
        $values = $event->getData();

        // If it's not answered, we have nothing to do.
        if (!$values['responses'][1]['value']) {
            return;
        }

        $projectType = APIEnterpriseTypeResolver::getAPIEnterpriseProjectTypeFromString(
            json_decode($values['responses'][1]['value'], true)['labels'][0]
        );

        // If it's not a local project, we have nothing to do.
        if (APIEnterpriseTypeResolver::LOCAL_PROJET !== $projectType) {
            return;
        }

        // If no type value, we can't do anything.
        if (!$values['responses'][20]['value']) {
            return;
        }

        $type = APIEnterpriseTypeResolver::getAPIEnterpriseTypeFromString(
            json_decode($values['responses'][20]['value'], true)['labels'][0]
        );

        if (APIEnterpriseTypeResolver::ASSOCIATION === $type) {
            // We check if it's no RNA and no SIRET, we can't do anything.
            if ($values['responses'][32]['value']) {
                if ('Non' === json_decode($values['responses'][32]['value'], true)['labels'][0]) {
                    return;
                }
            }
        }

        // rna
        $rna = $values['responses'][33]['value'] ?? null;

        // siret
        $siret = !$rna ? $this->getSiret($values) : null;

        if ($siret) {
            $mainInfoKey =
                trim($siret) .
                '_' .
                $type .
                '_' .
                AutoCompleteFromSiretQueryResolver::AUTOCOMPLETE_SIRET_CACHE_KEY;
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
                        $values['responses'][27]['medias'] = $this->setMediaFromAPIOrRequest(
                            $values['responses'][27]['medias'],
                            $mainInfo['sirenSituation']
                        );
                    }

                    break;
                case APIEnterpriseTypeResolver::ENTERPRISE:
                    $values['responses'][54]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][54]['medias'],
                        $mainInfo['sirenSituation']
                    );
                    $values['responses'][57]['value'] =
                        $values['responses'][57]['value'] ?? $mainInfo['turnover'];

                    break;
                case APIEnterpriseTypeResolver::PUBLIC_ORGA:
                    $values['responses'][66]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][66]['medias'],
                        $mainInfo['sirenSituation']
                    );

                    break;
            }
        }
        $docInfoKey =
            trim($siret ?? $rna) .
            '_' .
            $type .
            '_' .
            AutoCompleteDocQueryResolver::AUTOCOMPLETE_DOC_CACHE_KEY;
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
                    $values['responses'][28]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][28]['medias'],
                        $docInfo['compositionCA']
                    );
                    $values['responses'][29]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][29]['medias'],
                        $docInfo['status']
                    );
                }
                if ($rna) {
                    // Composition du conseil d'administration et du bureau
                    $values['responses'][38]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][38]['medias'],
                        $docInfo['compositionCA']
                    );
                    // Récépissé de la déclaration en préfecture (greffe des associations)
                    $values['responses'][39]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][39]['medias'],
                        $docInfo['prefectureReceiptConfirm']
                    );
                    // Statuts en vigueur datés et signés
                    $values['responses'][41]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][41]['medias'],
                        $docInfo['status']
                    );
                }

                break;
            case APIEnterpriseTypeResolver::ENTERPRISE:
                $values['responses'][55]['medias'] = $this->setMediaFromAPIOrRequest(
                    $values['responses'][55]['medias'],
                    $docInfo['fiscalRegulationAttestation']
                );
                $values['responses'][56]['medias'] = $this->setMediaFromAPIOrRequest(
                    $values['responses'][56]['medias'],
                    $docInfo['socialRegulationAttestation']
                );
                $values['responses'][58]['medias'] = $this->setMediaFromAPIOrRequest(
                    $values['responses'][58]['medias'],
                    $docInfo['kbis']
                );

                break;
            case APIEnterpriseTypeResolver::PUBLIC_ORGA:
                $values['responses'][67]['medias'] = $this->setMediaFromAPIOrRequest(
                    $values['responses'][67]['medias'],
                    $docInfo['kbis']
                );

                break;
        }
        $event->setData($values);
    }

    public function prefillForm(FormEvent $event): void
    {
        $env = EnvHelper::get('SYMFONY_INSTANCE_NAME');
        if ('idf-bp-dedicated' === $env || 'dev' === $env) {
            // Warning: This will be called on every proposalForms
            $this->getAPIEnterpriseData($event);
        }
    }
}
