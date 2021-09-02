<?php

namespace Capco\AppBundle\Form\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

class NoCommentWhenPrivateSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents()
    {
        return [FormEvents::POST_SUBMIT => 'postSubmit'];
    }

    public function postSubmit(FormEvent $event)
    {
        $form = $event->getForm();
        if ($form->has('comment') && $form->has('private')) {
            $comment = $form->get('comment')->getData();
            $private = $form->get('private')->getData();
            if (!empty($comment) && true === $private) {
                $form['private']->addError(
                    new FormError('You can not add a comment when voting anonymously.')
                );
            }
        }
    }
}
