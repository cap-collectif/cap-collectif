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
                return null;
            }

            return [$apiMediaId];
        }

        return $default;
    }

    public function getSiret(array $values): ?string
    {
        if (isset($values['responses'][21]['value'])) {
            return $values['responses'][21]['value'];
        }

        if (isset($values['responses'][48]['value'])) {
            return $values['responses'][48]['value'];
        }

        return $values['responses'][60]['value'] ?? null;
    }

    public function getAPIEnterpriseData(FormEvent $event): void
    {
        $values = $event->getData();
        $type = APIEnterpriseTypeResolver::getAPIEnterpriseTypeFromString(
            json_decode($values['responses'][19]['value'], true)['labels'][0]
        );
        $id = $values['responses'][32]['value'] ?? null;
        $siret = !$id ? $this->getSiret($values) : null;

        if ($siret) {
            $mainInfoKey =
                $siret .
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
                        $values['responses'][26]['medias'] = $this->setMediaFromAPIOrRequest(
                            $values['responses'][26]['medias'],
                            $mainInfo['sirenSituation']
                        );
                    }

                    break;
                case APIEnterpriseTypeResolver::ENTERPRISE:
                    $values['responses'][53]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][53]['medias'],
                        $mainInfo['sirenSituation']
                    );
                    $values['responses'][56]['value'] =
                        $values['responses'][56]['value'] ?? $mainInfo['turnover'];

                    break;
                case APIEnterpriseTypeResolver::PUBLIC_ORGA:
                    $values['responses'][65]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][65]['medias'],
                        $mainInfo['sirenSituation']
                    );

                    break;
            }
        }
        $docInfoKey =
            ($siret ?? $id) .
            '_' .
            $type .
            '_' .
            AutoCompleteDocQueryResolver::AUTOCOMPLETE_DOC_CACHE_KEY;
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
                    $values['responses'][27]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][27]['medias'],
                        $docInfo['compositionCA']
                    );
                    $values['responses'][28]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][28]['medias'],
                        $docInfo['status']
                    );
                }
                if ($id) {
                    $values['responses'][37]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][37]['medias'],
                        $docInfo['compositionCA']
                    );
                    $values['responses'][38]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][38]['medias'],
                        $docInfo['status']
                    );
                    $values['responses'][39]['medias'] = $this->setMediaFromAPIOrRequest(
                        $values['responses'][39]['medias'],
                        $docInfo['prefectureReceiptConfirm']
                    );
                }

                break;
            case APIEnterpriseTypeResolver::ENTERPRISE:
                $values['responses'][54]['medias'] = $this->setMediaFromAPIOrRequest(
                    $values['responses'][54]['medias'],
                    $docInfo['fiscalRegulationAttestation']
                );
                $values['responses'][55]['medias'] = $this->setMediaFromAPIOrRequest(
                    $values['responses'][55]['medias'],
                    $docInfo['socialRegulationAttestation']
                );
                $values['responses'][57]['medias'] = $this->setMediaFromAPIOrRequest(
                    $values['responses'][57]['medias'],
                    $docInfo['kbis']
                );

                break;
            case APIEnterpriseTypeResolver::PUBLIC_ORGA:
                $values['responses'][66]['medias'] = $this->setMediaFromAPIOrRequest(
                    $values['responses'][66]['medias'],
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
            //                        'dev' === $env ||
            // TODO Fixme @Jpec
            'api-enterprise-3' === $env
        ) {
            $this->getAPIEnterpriseData($event);
        }
    }
}
