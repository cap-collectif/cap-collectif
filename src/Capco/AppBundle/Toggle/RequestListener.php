<?php
namespace Capco\AppBundle\Toggle;

use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Translation\TranslatorInterface;

use Capco\AppBundle\Toggle\Manager;

class RequestListener
{
    protected $manager;

    public function __construct(Manager $manager, TranslatorInterface $translator)
    {
        $this->manager = $manager;
        $this->translator = $translator;
    }

    public function onKernelRequest(GetResponseEvent $event)
    {
        $request = $event->getRequest();
        $flag = $request->attributes->get('_feature_flag');

        if (null !== $flag && !$this->manager->isActive($flag)) {
            $message = $this->translator->trans('error.feature_not_enabled', array(), 'CapcoAppBundle');
            throw new NotFoundHttpException($message);
        }
    }
}

