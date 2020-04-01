<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise\APIEnterpriseTypeResolver;
use Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise\AutoCompleteDocQueryResolver;
use Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise\AutoCompleteFromSiretQueryResolver;
use Capco\AppBundle\Helper\EnvHelper;
use Capco\MediaBundle\Entity\Media;
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

    public function setMediaFromAPIOrRequest(array $default, ?Media $fallback): ?array
    {
        if (empty($default)) {
            if (!$fallback) {
                return null;
            }

            return [$fallback->getId()];
        }

        return $default;
    }

    public function getAPIEnterpriseData(FormEvent $event): void
    {
        $values = $event->getData();
        $type = APIEnterpriseTypeResolver::getAPIEnterpriseTypeFromString(
            json_decode($values['responses'][10]['value'], true)['labels'][0]
        );
        $siret = $values['responses'][12]['value'] ?? null;
        $id = $values['responses'][27]['value'] ?? null;
        if ($siret) {
            $mainInfoKey =
                $siret . '_' . AutoCompleteFromSiretQueryResolver::AUTOCOMPLETE_SIRET_CACHE_KEY;
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
                        $values['responses'][17]['medias'] = $this->setMediaFromAPIOrRequest(
                            $values['responses'][17]['medias'],
                            $mainInfo['sirenSituation']
                        );
                        $values['responses'][20]['value'] =
                            $values['responses'][20]['value'] ?? $mainInfo['turnover'];
                        $values['responses'][21]['medias'] = $this->setMediaFromAPIOrRequest(
                            $values['responses'][21]['medias'],
                            $mainInfo['kbis']
                        );
                    }

                    break;
                case APIEnterpriseTypeResolver::ENTERPRISE:
                    $values['responses'][49]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][49]['medias'],
                        $mainInfo['sirenSituation']
                    );
                    $values['responses'][52]['value'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][52]['value'],
                        $mainInfo['turnover']
                    );

                    break;
                case APIEnterpriseTypeResolver::PUBLIC_ORGA:
                    $values['responses'][61]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][61]['medias'],
                        $mainInfo['sirenSituation']
                    );

                    break;
            }
        }
        $docInfoKey =
            ($siret ?? $id) . '_' . AutoCompleteDocQueryResolver::AUTOCOMPLETE_DOC_CACHE_KEY;
        if (!$this->cache->hasItem($docInfoKey)) {
            $args = new Argument([
                'id' => $siret ?? $id,
                'type' => $type,
            ]);
            $this->autoCompleteDocQueryResolver->__invoke($args);
        }

        $docInfo = $this->cache->getItem($docInfoKey)->get();
        switch ($type) {
            case APIEnterpriseTypeResolver::ASSOCIATION:
                if ($siret) {
                    $values['responses'][22]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][22]['medias'],
                        $docInfo['compositionCA']
                    );
                    $values['responses'][23]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][23]['medias'],
                        $docInfo['status']
                    );
                    $values['responses'][18]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][18]['medias'],
                        $docInfo['fiscalRegulationAttestation']
                    );
                    $values['responses'][19]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][19]['medias'],
                        $docInfo['socialRegulationAttestation']
                    );
                }
                if ($id) {
                    $values['responses'][32]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][32]['medias'],
                        $docInfo['compositionCA']
                    );
                    $values['responses'][33]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][33]['medias'],
                        $docInfo['status']
                    );
                    $values['responses'][34]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][34]['medias'],
                        $docInfo['prefectureReceiptConfirm']
                    );
                }

                break;
            case APIEnterpriseTypeResolver::ENTERPRISE:
                $values['responses'][50]['medias'] = $this->setMediaFromAPIOrRequest(
                    $values['responses'][50]['medias'],
                    $docInfo['fiscalRegulationAttestation']
                );
                $values['responses'][51]['medias'] = $this->setMediaFromAPIOrRequest(
                    $values['responses'][51]['medias'],
                    $docInfo['socialRegulationAttestation']
                );
                $values['responses'][53]['medias'] = $this->setMediaFromAPIOrRequest(
                    $values['responses'][53]['medias'],
                    $docInfo['kbis']
                );

                break;
            case APIEnterpriseTypeResolver::PUBLIC_ORGA:
                $values['responses'][62]['medias'] = $this->setMediaFromAPIOrRequest(
                    $values['responses'][62]['medias'],
                    $docInfo['kbis']
                );

                break;
        }
        $event->setData($values);
    }

    public function prefillForm(FormEvent $event): void
    {
        $env = EnvHelper::get('SYMFONY_INSTANCE_NAME');
        if (
            'idf-bp-dedicated' === $env ||
            'dev' === $env ||
            '10091-api-enterprise-part-2' === $env
        ) {
            $this->getAPIEnterpriseData($event);
        }
    }
}
