<?php
namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Toggle\Manager;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Translation\TranslatorInterface;

class FeatureToggleListener
{
    protected $manager;
    protected $translator;
    protected $logger;

    public function __construct(
        Manager $manager,
        TranslatorInterface $translator,
        LoggerInterface $logger
    ) {
        $this->manager = $manager;
        $this->translator = $translator;
        $this->logger = $logger;
    }

    public function onKernelRequest(GetResponseEvent $event)
    {
        $request = $event->getRequest();
        // Disabled feature flag on requested url
        $flagsAttributes = $request->attributes->get('_feature_flags');
        $flags = $flagsAttributes ? explode(',', $flagsAttributes) : [];

        foreach ($flags as $flag) {
            if ($flag && !$this->manager->isActive($flag)) {
                $message = sprintf(
                    '%s (%s)',
                    $this->translator->trans('error.feature_not_enabled', [], 'CapcoAppBundle'),
                    $flag
                );
                $this->logger->warning($message);
                throw new NotFoundHttpException(
                    $this->translator->trans('error.feature_not_enabled', [], 'CapcoAppBundle')
                );
            }
        }
    }
}
