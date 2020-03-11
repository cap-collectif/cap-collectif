<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\AppBundle\Traits\FormatDateTrait;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class LocaleSubscriber implements EventSubscriberInterface
{
    use FormatDateTrait;
    protected $siteParameters;
    protected $toggleManager;
    protected $entityManager;

    public function __construct(
        SiteParameterResolver $siteParameters,
        Manager $toggleManager,
        EntityManagerInterface $entityManager
    ) {
        $this->siteParameters = $siteParameters;
        $this->toggleManager = $toggleManager;
        $this->entityManager = $entityManager;
    }

    public function onKernelRequest(RequestEvent $event)
    {
        $timeZone = $this->siteParameters->getValue('global.timezone');
        if ($timeZone && date_default_timezone_get() !== $timeZone) {
            date_default_timezone_set(static::clearTimeZone($timeZone));
        }

        $request = $event->getRequest();

        $inputLocale = null;
        if ($this->toggleManager->isActive('unstable__multilangue') && $request->getLocale()) {
            $inputLocale = $request->getLocale();
        }
        $request->setLocale($this->getValidLocale($inputLocale));
    }

    public static function getSubscribedEvents()
    {
        return [
            // must be registered before (i.e. with a higher priority than) the default Locale listener
            KernelEvents::REQUEST => [['onKernelRequest', 15]]
        ];
    }

    private function getValidLocale(?string $inputLocale): string
    {
        return $this->toggleManager->isActive('unstable__multilangue')
            ? $this->entityManager->getRepository(Locale::class)->getValidCode($inputLocale)
            : $this->siteParameters->getValue('global.locale');
    }
}
