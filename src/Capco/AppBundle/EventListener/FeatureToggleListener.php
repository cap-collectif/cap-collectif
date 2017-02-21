<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Translation\TranslatorInterface;

class FeatureToggleListener
{
    protected $manager;
    protected $translator;

    public function __construct(Manager $manager, TranslatorInterface $translator)
    {
        $this->manager = $manager;
        $this->translator = $translator;
    }

    public function onKernelRequest(GetResponseEvent $event)
    {
        $request = $event->getRequest();
        // Disabled feature flag on requested url
        $flagsAttributes = $request->attributes->get('_feature_flags');
        $flags = $flagsAttributes ? explode(',', $flagsAttributes) : [];

        foreach ($flags as $flag) {
            if ($flag && !$this->manager->isActive($flag)) {
                $message = $this->translator->trans('error.feature_not_enabled', [], 'CapcoAppBundle');
                throw new NotFoundHttpException($message);
            }
        }
    }
}
