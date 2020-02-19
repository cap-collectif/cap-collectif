<?php

namespace Capco\AppBundle\Router;

use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\Toggle\Manager;
use JMS\I18nRoutingBundle\Exception\NotAcceptableLanguageException;
use JMS\I18nRoutingBundle\Router\I18nLoader;
use JMS\I18nRoutingBundle\Router\LocaleResolverInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Exception\ResourceNotFoundException;
use Symfony\Component\Routing\Matcher\RequestMatcherInterface;
use Symfony\Component\Routing\RequestContext;

class I18nRouter extends \JMS\I18nRoutingBundle\Router\I18nRouter
{
    protected $manager;
    protected $localeRepository;
    protected $logger;
    protected $container;

    protected $hostMap = [];
    private $redirectToHost = true;
    private $jmsLocaleResolver;
    private $localeResolver;

    public function __construct(
        LocaleResolver $localeResolver,
        LocaleResolverInterface $jmsLocaleResolver,
        LoggerInterface $logger,
        Manager $manager,
        LocaleRepository $localeRepository,
        ContainerInterface $container,
        $resource,
        array $options = [],
        RequestContext $context = null
    ) {
        $this->manager = $manager;
        $this->localeRepository = $localeRepository;
        $this->container = $container;
        $this->logger = $logger;
        $this->localeResolver = $localeResolver;
        $this->jmsLocaleResolver = $jmsLocaleResolver;
        parent::__construct($container, $resource, $options, $context);
    }

    /**
     * We remove unnecessary locale prefix from the uri if the current locale is the default one.
     */
    public static function formatDefaultLocaleUrl(
        string $url,
        string $defaultLocale,
        string $host,
        string $scheme
    ): ?string {
        $defaultLocalePrefix = DefaultPatternGenerationStrategy::getLocalePrefix($defaultLocale);
        $baseUrl = $scheme . '://' . $host;
        if (preg_match("/^\\/${defaultLocalePrefix}\\/?/", $url)) {
            $url = substr($url, 3);
        } else {
            $escapedHost = preg_quote($host, '/');
            $url = preg_replace(
                "/^https?:\\/\\/(www)?${escapedHost}.*\\/${defaultLocalePrefix}\\//",
                "${baseUrl}/",
                $url
            );
        }

        return $url;
    }

    public function generate(
        $name,
        $parameters = [],
        $referenceType = \JMS\I18nRoutingBundle\Router\I18nRouter::ABSOLUTE_PATH
    ) {
        $isMultilingual = $this->manager->isActive('unstable__multilangue');
        //TODO keep in cache ?
        $defaultLocale = $this->localeResolver->getDefaultLocaleCode();
        if (!$isMultilingual || ($isMultilingual && !isset($parameters['_locale']))) {
            $parameters['_locale'] = $defaultLocale;
        }

        $url = \JMS\I18nRoutingBundle\Router\I18nRouter::generate(
            $name,
            $parameters,
            $referenceType
        );

        return self::formatDefaultLocaleUrl(
            $url,
            $defaultLocale,
            $this->context->getHost(),
            $this->context->getScheme()
        );
    }

    public function match($url)
    {
        return $this->matchI18n(parent::match($url), $url);
    }

    public function matchRequest(Request $request)
    {
        $matcher = $this->getMatcher();
        $pathInfo = $request->getPathInfo();
        if (!$matcher instanceof RequestMatcherInterface) {
            return $this->matchI18n($matcher->match($pathInfo), $pathInfo);
        }

        return $this->matchI18n($matcher->matchRequest($request), $pathInfo);
    }

    //Here we check if a route exists when appending the default locale prefix, if it does, we "redirect" (without
    //actually changing url from the user pov) by changing the url.
    private function checkMatchWithLocaleRoutes(array $params, string $url): array
    {
        //TODO keep in cache ?
        $defaultLocalePrefix = $this->localeResolver->getDefaultLocaleRoutePrefix();
        if (
            'capco_app_cms' === $params['_route'] &&
            isset($params['url']) &&
            false === strpos($params['url'], "/${defaultLocalePrefix}/")
        ) {
            $isHomePage = false;
            //Test beforehand if it is a locale since with cms routes, it doesn't easily find the homecontroller
            if (2 === \strlen($params['url'])) {
                try {
                    $paramsUrl = $params['url'];
                    $routeMatch = $this->match("/${paramsUrl}/");
                    $params = $routeMatch;
                    $url = isset($params['url'])
                        ? "/${defaultLocalePrefix}/" . $params['url']
                        : "/${defaultLocalePrefix}/";
                    $isHomePage = true;
                } catch (\Exception $e) {
                }
            }
            if (!$isHomePage) {
                try {
                    $routeMatch = $this->match("/${defaultLocalePrefix}/" . $params['url']);
                    $params = $routeMatch;
                    $url = isset($params['url'])
                        ? "/${defaultLocalePrefix}/" . $params['url']
                        : "/${defaultLocalePrefix}/";
                } catch (\Exception $e) {
                    //No route exists with the default local prefix
                }
            }
        }

        return ['url' => $url, 'params' => $params];
    }

    private function matchI18n(array $params, $url)
    {
        if (false === $params) {
            return false;
        }

        $match = $this->checkMatchWithLocaleRoutes($params, $url);
        $params = $match['params'];
        $url = $match['url'];

        $request = $this->getRequest();

        if (isset($params['_locales'])) {
            if (false !== ($pos = strpos($params['_route'], I18nLoader::ROUTING_PREFIX))) {
                $params['_route'] = substr(
                    $params['_route'],
                    $pos + \strlen(I18nLoader::ROUTING_PREFIX)
                );
            }

            if (!($currentLocale = $this->context->getParameter('_locale')) && null !== $request) {
                $currentLocale = $this->jmsLocaleResolver->resolveLocale(
                    $request,
                    $params['_locales']
                );

                // If the locale resolver was not able to determine a locale, then all efforts to
                // make an informed decision have failed. Just display something as a last resort.
                if (!$currentLocale) {
                    $currentLocale = reset($params['_locales']);
                }
            }

            if (!\in_array($currentLocale, $params['_locales'], true)) {
                // if the available locales are on a different host, throw a ResourceNotFoundException
                if ($this->hostMap) {
                    // generate host maps
                    $hostMap = $this->hostMap;
                    $availableHosts = array_map(function ($locale) use ($hostMap) {
                        return $hostMap[$locale];
                    }, $params['_locales']);

                    $differentHost = true;
                    foreach ($availableHosts as $host) {
                        if ($this->hostMap[$currentLocale] === $host) {
                            $differentHost = false;

                            break;
                        }
                    }

                    if ($differentHost) {
                        throw new ResourceNotFoundException(
                            sprintf(
                                'The route "%s" is not available on the current host "%s", but only on these hosts "%s".',
                                $params['_route'],
                                $this->hostMap[$currentLocale],
                                implode(', ', $availableHosts)
                            )
                        );
                    }
                }

                // no host map, or same host means that the given locale is not supported for this route
                throw new NotAcceptableLanguageException($currentLocale, $params['_locales']);
            }

            unset($params['_locales']);
            $params['_locale'] = $currentLocale;
        } elseif (
            isset($params['_locale']) &&
            0 < ($pos = strpos($params['_route'], I18nLoader::ROUTING_PREFIX))
        ) {
            $params['_route'] = substr(
                $params['_route'],
                $pos + \strlen(I18nLoader::ROUTING_PREFIX)
            );
        }

        if (
            isset($params['_locale'], $this->hostMap[$params['_locale']]) &&
            $this->context->getHost() !== ($host = $this->hostMap[$params['_locale']])
        ) {
            if (!$this->redirectToHost) {
                throw new ResourceNotFoundException(
                    sprintf(
                        'Resource corresponding to pattern "%s" not found for locale "%s".',
                        $url,
                        $this->getContext()->getParameter('_locale')
                    )
                );
            }

            return [
                '_controller' =>
                    'JMS\I18nRoutingBundle\Controller\RedirectController::redirectAction',
                'path' => $url,
                'host' => $host,
                'permanent' => true,
                'scheme' => $this->context->getScheme(),
                'httpPort' => $this->context->getHttpPort(),
                'httpsPort' => $this->context->getHttpsPort(),
                '_route' => $params['_route']
            ];
        }
        if (
            !isset($params['_locale']) &&
            null !== $request &&
            ($locale = $this->jmsLocaleResolver->resolveLocale(
                $request,
                $this->container->getParameter('jms_i18n_routing.locales')
            ))
        ) {
            $params['_locale'] = $locale;
        }

        return $params;
    }

    private function getRequest()
    {
        $request = null;
        if ($this->container->has('request_stack')) {
            $request = $this->container->get('request_stack')->getCurrentRequest();
        } elseif (
            method_exists($this->container, 'isScopeActive') &&
            $this->container->isScopeActive('request')
        ) {
            $request = $this->container->get('request');
        }

        return $request;
    }
}
