<?php

namespace Capco\AppBundle\Router;

use Capco\AppBundle\Exception\LocaleConfigurationException;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Toggle\Manager;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Routing\RequestContext;

class I18nRouter extends \JMS\I18nRoutingBundle\Router\I18nRouter
{
    protected $manager;
    protected $localeRepository;
    protected $locale;
    protected $logger;

    protected $container;

    public function __construct(
        LoggerInterface $logger,
        Manager $manager,
        LocaleRepository $localeRepository,
        ContainerInterface $container,
        $resource,
        $locale,
        array $options = [],
        RequestContext $context = null
    ) {
        $this->manager = $manager;
        $this->localeRepository = $localeRepository;
        $this->locale = $locale;
        $this->container = $container;
        $this->logger = $logger;
        parent::__construct($container, $resource, $options, $context);
    }

    public function generate(
        $name,
        $parameters = [],
        $referenceType = \JMS\I18nRoutingBundle\Router\I18nRouter::ABSOLUTE_PATH
    ) {
        if ($this->manager->isActive('unstable__multilangue')) {
            return \JMS\I18nRoutingBundle\Router\I18nRouter::generate(
                $name,
                $parameters,
                $referenceType
            );
        }

        try {
            $parameters['_locale'] = $this->localeRepository->getDefaultCode();
        } catch (LocaleConfigurationException $e) {
            $parameters['_locale'] = $this->locale;
            $this->logger->warning(
                'Default locale is not configured with unstable__multilangue yet activated: using symfony s default locale'
            );
        }

        return \JMS\I18nRoutingBundle\Router\I18nRouter::generate(
            $name,
            $parameters,
            $referenceType
        );
    }
}
