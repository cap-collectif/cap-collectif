<?php

namespace Capco\AppBundle\Form\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\Form\FormEvent;

class NoCommentWhenPrivateSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents()
    {
        return array(FormEvents::POST_SUBMIT => 'postSubmit');
    }

    public function postSubmit(FormEvent $event)
    {
        $form = $event->getForm();
        if ($form->has('comment') && $form->has('private')) {
            $comment = $form->get('comment')->getData();
            $private = $form->get('private')->getData();
            if (!empty($comment) && $private == true) {
                $form['anonymous']->addError(new FormError('proposal.vote.no_comment_when_private_error'));
            }
        }
    }
}
