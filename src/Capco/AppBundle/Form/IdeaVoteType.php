<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Capco\UserBundle\Entity\User;

class IdeaVoteType extends AbstractType
{
    private $user;
    private $confirmed;
    private $commentable;

    public function __construct(User $user = null, $confirmed, $commentable)
    {
        $this->user = $user;
        $this->confirmed = $confirmed;
        $this->commentable = $commentable;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $noMessageWhenPrivateValidator = function (FormEvent $event) {
            $form = $event->getForm();
            if ($form->has('message') && $form->has('private')) {
                $message = $form->get('message')->getData();
                $private = $form->get('private')->getData();
                if (!empty($message) && $private == true) {
                    $form['private']->addError(new FormError('idea.vote.no_message_when_private_error'));
                }
            }
        };

        if ($this->confirmed) {
            $builder->add('submit', 'submit', [
              'label' => 'idea.vote.unsubscribe',
              'attr' => ['class' => 'btn  btn-danger  btn-block'],
            ]);

            return;
        }

        if ($this->user != null) {
            if ($this->commentable) {
                $builder->add('message', 'textarea', [
                    'required' => false,
                    'mapped' => false,
                    'label' => 'idea.vote.comment',
                    'attr' => [
                        'placeholder' => 'idea.vote.message',
                        'rows' => 5,
                        'style' => 'resize: vertical;',
                    ],
                ]);
            }

            $builder
              ->add('private', null, [
                  'required' => false,
                  'label' => 'idea.vote.private',
              ])
            ;

            $builder
              ->add('submit', 'submit', [
                  'label' => 'idea.vote.submit',
                  'attr' => ['class' => 'btn btn-success btn-block'],
              ])
            ;

            $builder->addEventListener(FormEvents::POST_SUBMIT, $noMessageWhenPrivateValidator);

            return;
        }

        $builder
            ->add('username', null, [
                  'label' => 'idea.vote.name',
            ])
            ->add('email', 'email', [
                  'label' => 'idea.vote.email',
            ])
        ;

        if ($this->commentable) {
            $builder->add('message', 'textarea', [
                'required' => false,
                'mapped' => false,
                'label' => 'idea.vote.comment',
                'attr' => [
                    'placeholder' => 'idea.vote.message',
                    'rows' => 5,
                    'style' => 'resize: vertical;',
                ],
            ]);
        }

        $builder->add('private', null, [
            'required' => false,
            'label' => 'idea.vote.private',
        ]);

        $builder
            ->add('submit', 'submit', [
                  'label' => 'idea.vote.submit',
                  'attr' => ['class' => 'btn  btn-success  btn-block'],
            ])
        ;

        $builder->addEventListener(FormEvents::POST_SUBMIT, $noMessageWhenPrivateValidator);
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'Capco\AppBundle\Entity\IdeaVote',
            'translation_domain' => 'CapcoAppBundle',
        ]);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_app_idea_vote';
    }
}
