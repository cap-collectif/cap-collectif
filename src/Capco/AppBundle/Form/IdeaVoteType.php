<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorage;
use Capco\AppBundle\Form\EventListener\NoCommentWhenPrivateSubscriber;

class IdeaVoteType extends AbstractType
{
    private $tokenStorage;

    public function __construct(TokenStorage $tokenStorage)
    {
        $this->tokenStorage = $tokenStorage;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if ($this->tokenStorage->getToken()->getUser()) {
            $builder
                ->add('username', null, [
                    'required' => true,
                ])
                ->add('email', 'email', [
                    'required' => true,
                ])
            ;
        }

        if ($options['commentable']) {
            $builder
                ->add(
                    'comment',
                    'textarea',
                    [
                        'required' => false,
                        'mapped' => false,
                    ]
                );
        }

        $builder->add('private', null, [
                'required' => false,
            ])
            ->addEventSubscriber(new NoCommentWhenPrivateSubscriber())
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'Capco\AppBundle\Entity\IdeaVote',
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle',
            'commentable' => false,
        ]);
        $resolver->setRequired('commentable');
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'idea_vote';
    }
}
